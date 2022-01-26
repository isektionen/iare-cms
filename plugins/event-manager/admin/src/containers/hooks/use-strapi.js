import {
	useRecoilCallback,
	atom,
	selector,
	useRecoilValue,
	selectorFamily,
} from "recoil";
import { useCallback, useState } from "react";
import axios from "axios";
import { json2csv } from "json-2-csv";
import { saveAs } from "file-saver";
import qs from "qs";

const getAuthToken = () => {
	const unparsedToken = localStorage["jwtToken"]
		? localStorage["jwtToken"]
		: sessionStorage["jwtToken"];
	if (unparsedToken) {
		const parsedToken = JSON.parse(unparsedToken);
		return parsedToken;
	}
	return null;
};

const conformAmount = (amount, currency, format = true) => {
	if (!format) {
		if (_.isObject(amount)) {
			return amount.amount / 100;
		}
		return amount / 100;
	}
	if (_.isObject(amount)) {
		return `${amount.amount / 100} ${amount.currency}`;
	}
	return `${amount / 100} ${currency || "SEK"}`;
};

const strapiClient = _.memoize(() =>
	axios.create({
		baseURL: strapi.backendURL,
		headers: {
			Authorization: `Bearer ${getAuthToken()}`,
		},
	})
);

const userAtom = atom({
	key: "ATOM/USER",
	default: null,
});

const currentEventAtom = atom({
	key: "ATOM/CEVENT",
	default: null,
});

const userState = selector({
	key: "SELECTOR/USER",
	get: async ({ get }) => {
		const user = get(userAtom);
		if (user) {
			return user;
		}
		const client = strapiClient();
		const res = await client.get("/users/me");
		return res.data;
	},
});

const roleSelector = selectorFamily({
	key: "SELECTOR/USERROLES",
	get:
		(code) =>
		async ({ get }) => {
			const user = get(userState);
			if (user) {
				return user.roles.some((p) => p.code.includes(code));
			}
			return false;
		},
});

const eventsAtom = atom({
	key: "ATOM/EVENT",
	default: [],
});

const RepresentativeState = selector({
	key: "SELECTOR/REPRESENTATIVE",
	get: async ({ get }) => {
		const user = get(userState);
		if (user) {
			const client = strapiClient();
			const result = await client.get(`/representatives?user=${user.id}`);
			return _.map(result.data, "id");
		}
		return [];
	},
});

const committeeState = selector({
	key: "SELECTOR/COMMITTEE",
	get: async ({ get }) => {
		const representatives = get(RepresentativeState);
		if (representatives) {
			const query = representatives
				.map((p) => `representatives_in=${p}`)
				.join("&");
			const client = strapiClient();
			const result = await client.get(`/committees?${query}`);
			return _.map(result.data, (p) => _.pick(p, ["id", "name"]));
		}
		return [];
	},
});

const eventState = selector({
	key: "SELECTOR/EVENT",
	get: async ({ get }) => {
		const events = get(eventsAtom);
		const isSuperAdmin = get(roleSelector("strapi-super-admin"));
		const isKassor = get(roleSelector("kassor"));

		if (events.length > 0) {
			return events;
		}

		if (isSuperAdmin || isKassor) {
			const client = strapiClient();
			const events = await client.get(
				"/events?_publicationState=preview"
			);
			return events.data;
		}
		return [];
	},
});

const orderSelector = selectorFamily({
	key: "SELECTOR/ORDER",
	get:
		(slug) =>
		async ({ get }) => {
			const allEvents = get(eventState);
			if (allEvents) {
				const event = allEvents.find((p) => p.slug === slug);
				if (event) {
					const client = strapiClient();
					const result = await client.get(
						`/orders?event=${event.id}`
					);
					return result.data;
				}
			}
			return [];
		},
});

const conformedOrderMapper = (order) => ({
	event: order.event.slug,
	paymentId: order.data?.paymentData?.paymentId ?? "N/A",
	reference: order.data?.order?.reference ?? "N/A",
	fullName:
		order.data?.customerData?.firstName +
			" " +
			order.data?.customerData?.lastName ?? "N/A",
	amount:
		conformAmount(
			order.data.order.amount,
			order.data.order.currency,
			false
		) ?? "N/A",
	products: order.data.order.items
		.map((p) => `${p.reference}`.repeat(p.quantity))
		.join(" "),
	options: order.data.options
		.map(
			(p) =>
				`${p.label}: ${
					p.type === "select"
						? p.data.map((d) => "#" + d.label).join(" ")
						: p.data
								.filter((d) => d !== null)
								.map((d) => "#" + d)
								.join(" ")
				}`
		)
		.join(" "),
});

const toFile = (data, fileName = "orders.csv") => {
	json2csv(data, (err, csv) => {
		if (err) return;

		const file = new File([csv], fileName, {
			type: "text/csv;charset=utf-8",
		});
		saveAs(file);
	});
};

export const useStrapi = () => {
	const events = useRecoilValue(eventState);

	const _isSuperAdmin = useRecoilValue(roleSelector("strapi-super-admin"));
	const _isKassor = useRecoilValue(roleSelector("kassor"));

	const authenticate = useRecoilCallback(({ set, snapshot }) => async () => {
		const user = await snapshot.getPromise(userState);
		const cachedUser = await snapshot.getPromise(userAtom);
		if (user && !cachedUser) {
			set(userAtom, user);
			const isSuperAdmin = await snapshot.getPromise(
				roleSelector("strapi-super-admin")
			);
			const isKassor = await snapshot.getPromise(roleSelector("kassor"));

			const client = strapiClient();
			if (isSuperAdmin || isKassor) {
				const result = await client.get(
					"/events?_publicationState=preview"
				);
				return set(eventsAtom, result.data);
			} else {
				const committees = await snapshot.getPromise(committeeState);
				if (committees.length > 0) {
					const query = qs.stringify({
						_where: {
							_or: [
								{ created_by: user.id },
								{ committee_in: _.map(committees, "id") },
							],
						},
					});
					const result = await client.get(
						`/events?_publicationState=preview&${query}`
					);
					set(eventsAtom, result.data);
				}
			}
		}
	});

	const isAuthorized = useCallback((slug) => {
		if (!slug) {
			return false;
		}

		return events.find((p) => p.slug === slug);
	});

	const resetCursor = useRecoilCallback(({ set }) => async () => {
		set(currentEventAtom, null);
	});

	const getEventOrders = useRecoilCallback(
		({ snapshot, set }) =>
			async (slug) => {
				const orders = await snapshot.getPromise(orderSelector(slug));
				const events = await snapshot.getPromise(eventState);
				if (events) {
					const currentEvent = events.find((p) => p.slug === slug);
					if (currentEvent) {
						set(currentEventAtom, currentEvent.id);
					}
				}
				return orders;
			}
	);

	const hasRole = useRecoilCallback(({ snapshot }) => async (code) => {
		const state = await snapshot.getPromise(roleSelector(code));
		return state;
	});

	const createCSV = useRecoilCallback(
		({ snapshot }) =>
			async () => {
				const isSuperAdmin = await snapshot.getPromise(
					roleSelector("strapi-super-admin")
				);
				const isKassor = await snapshot.getPromise(
					roleSelector("kassor")
				);

				const currentEventId = await snapshot.getPromise(
					currentEventAtom
				);
				if (currentEventId) {
					const events = await snapshot.getPromise(eventState);
					if (events) {
						const currentEvent = events.find(
							(p) => p.id === currentEventId
						);
						if (currentEvent) {
							const slug = currentEvent.slug;
							const orders = await snapshot.getPromise(
								orderSelector(slug)
							);
							if (orders) {
								const adaptedOrders = _.map(
									orders,
									conformedOrderMapper
								);
								toFile(adaptedOrders);
							}
						}
					}
					return;
				}

				if (isSuperAdmin || isKassor) {
					const events = await snapshot.getPromise(eventState);
					if (events) {
						const eventSlugs = _.map(events, "slug");
						const adaptedEventOrders = await _.reduce(
							eventSlugs,
							async (acc, it) => {
								const orders = await snapshot.getPromise(
									orderSelector(it)
								);
								if (orders && orders.length > 0) {
									return [
										...(await acc),
										...orders.map(conformedOrderMapper),
									];
								}

								return [...(await acc)];
							},
							[]
						);

						toFile(adaptedEventOrders, "events.csv");
					}
				}
			},
		[]
	);

	return {
		isAuthorized,
		authenticate,
		events,
		getEventOrders,
		resetCursor,
		createCSV,
		isAdmin: _isSuperAdmin || _isKassor,
	};
};

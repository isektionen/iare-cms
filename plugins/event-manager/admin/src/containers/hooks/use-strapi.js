import {
	useRecoilCallback,
	atom,
	selector,
	useRecoilValue,
	selectorFamily,
} from "recoil";
import { useCallback, useEffect } from "react";
import axios from "axios";

const getAuthToken = () => {
	const unparsedToken = localStorage["jwtToken"]
		? localStorage["jwtToken"]
		: sessionStorage["jwtToken"];
	const parsedToken = JSON.parse(unparsedToken);
	return parsedToken;
};

const strapiClient = axios.create({
	baseURL: strapi.backendURL,
	headers: {
		Authorization: `Bearer ${getAuthToken()}`,
	},
});

const userAtom = atom({
	key: "ATOM/USER",
	default: null,
});

const userState = selector({
	key: "SELECTOR/USER",
	get: async ({ get }) => {
		const user = get(userAtom);
		if (user) {
			return user;
		}
		const res = await strapiClient.get("/users/me");
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
			const result = await strapiClient.get(
				`/representatives?user=${user.id}`
			);
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

			const result = await strapiClient.get(`/committees?${query}`);
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
			const events = await strapiClient.get("/events");
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
					const result = await strapiClient.get(
						`/orders?event=${event.id}`
					);
					return result.data;
				}
			}
			return [];
		},
});

export const useStrapi = () => {
	const events = useRecoilValue(eventState);

	const authenticate = useRecoilCallback(({ set, snapshot }) => async () => {
		const user = await snapshot.getPromise(userState);
		const cachedUser = await snapshot.getPromise(userAtom);
		if (user && !cachedUser) {
			set(userAtom, user);
			console.log(user);
			const isSuperAdmin = await snapshot.getPromise(
				roleSelector("strapi-super-admin")
			);
			const isKassor = await snapshot.getPromise(roleSelector("kassor"));

			if (isSuperAdmin || isKassor) {
				const result = await strapiClient.get("/events");
				set(eventsAtom, result.data);
			} else {
				const committees = await snapshot.getPromise(committeeState);
				console.log(committees);
				if (committees.length > 0) {
					const query = committees
						.map((p) => `committee_in=${p.id}`)
						.join("&");
					const result = await strapiClient.get(`/events?${query}`);
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

	const getEventOrders = useRecoilCallback(({ snapshot }) => async (slug) => {
		const orders = await snapshot.getPromise(orderSelector(slug));
		return orders;
	});

	const hasRole = useRecoilCallback(({ snapshot }) => async (code) => {
		const state = await snapshot.getPromise(roleSelector(code));
		return state;
	});

	return {
		isAuthorized,
		authenticate,
		events,
		getEventOrders,
	};
};

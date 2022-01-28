"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");
const _ = require("lodash");
const { isAfter, parseISO } = require("date-fns");
const sanitizeId = (value) => {
	if (/^-?\d+$/.test(value)) return { id: value };

	const nano = new RegExp(/^[A-Za-z0-9_-]{8}$/i);
	if (nano.test(value)) return { fullfillmentUID: value };
	return { slug: value };
};

const isAdmin = async (ctx) => {
	if (ctx && ctx.request && ctx.request.header) {
		if (ctx.request.header.authorization) {
			const authorization = ctx.request.header.authorization;
			const parts = authorization.split(" ");
			if (parts.length === 2) {
				const scheme = parts[0];
				const credentials = parts[1];
				if (/^Bearer$/i.test(scheme)) {
					const { isValid } =
						await strapi.admin.services.token.decodeJwtToken(
							credentials
						);
					return isValid;
				}
			}
		}
	}
	return false;
};

module.exports = {
	async validatePassword(ctx) {
		const { id } = ctx.params;
		const event = await strapi.query("event").findOne({ id });
		const body = ctx.request?.body ?? {};
		const maybePassword = body?.password ?? null;
		if (maybePassword && event) {
			if (event.passwordProtected) {
				const { password } = event.passwordProtected;
				return {
					valid: password === maybePassword,
				};
			}
		}
		ctx.response.status = 400;
	},
	async findOneBySlug(ctx) {
		const { _slug } = ctx.params;
		const event = await strapi.query("event").findOne({ slug: _slug });
		return event;
	},
	async find(ctx) {
		let entities;
		if (ctx.query._q) {
			entities = await strapi.services.event.search(ctx.query);
		} else {
			entities = await strapi.services.event.find(ctx.query);
		}
		return entities.map((entity) =>
			sanitizeEntity(entity, { model: strapi.models.event })
		);
	},
	async findOne(ctx) {
		const { id } = ctx.params;
		const entity = await strapi.services.event.findOne(sanitizeId(id));
		const sentity = sanitizeEntity(entity, { model: strapi.models.event });
		return sentity;
	},

	async requiresPassword(ctx) {
		const { id } = ctx.params;
		const entity = await strapi.query("event").findOne(sanitizeId(id));
		if (entity?.password) {
			ctx.response.status = 200;
			return;
		}
		return ctx.response.badRequest();
	},

	// returns a events available products
	async products(ctx) {
		const { ref } = ctx.params;
		const entity = await strapi.query("event").findOne({ slug: ref });

		if (!entity) {
			return ctx.response.badRequest();
		}

		const products = await strapi
			.query("product")
			.find({ reference_in: _.map(entity.products, "reference") });

		// reveals the availability of a product
		const detailedProducts = await Promise.all(
			products.map(async (obj) => ({
				..._.pick(obj, [
					"id",
					"media",
					"description",
					"reference",
					"name",
					"price",
					"stock",
					"count",
					"consumable",
				]),
				product_options: await Promise.all(
					obj.product_options.map(async (prod) => {
						return {
							...prod,
							data: await Promise.all(
								prod.data.map(async (d) => {
									if (d?.meta_option) {
										const meta_option =
											await strapi.services[
												"meta-option"
											].findOne({
												id: d.meta_option.id,
											});
										return {
											...d,
											meta_option: _.pick(meta_option, [
												"id",
												"name",
												"option",
											]),
										};
									}
									return d;
								})
							),
						};
					})
				),
				available: obj.count < obj.stock,
			}))
		);

		return detailedProducts;
	},

	// returns whether event is bookable
	async status(ctx) {
		const { ref } = ctx.params;
		const entity = await strapi.services.event.findOne({ slug: ref });
		if (!entity) {
			return ctx.response.badRequest();
		}

		const { schedule } = entity;
		if (!schedule || !schedule.deadline) {
			return ctx.response.badRequest();
		}
		const deadline = parseISO(schedule.deadline);
		const now = new Date();
		if (isAfter(now, deadline)) {
			return ctx.response.badRequest();
		}

		if (entity.maxCapacity <= entity.accumulator) {
			return ctx.response.badRequest();
		}

		ctx.response.status = 200;
	},
};

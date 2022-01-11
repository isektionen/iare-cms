"use strict";

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const _ = require("lodash");
const emailClient = require("../services/email");

function isNumeric(value) {
	return /^-?\d+$/.test(value);
}

const getIdentifier = ({ params }) => {
	if (params && params.id) {
		if (isNumeric(params.id)) return { id: params.id };

		return { reference: params.id };
	}
};

module.exports = {
	async create(ctx) {
		// must be guarded

		const { body } = ctx.request;

		if (!body || !body?.order?.reference || !body?.order?.items) {
			return ctx.response.badRequest();
		}
		// find event by its slug
		const [slug] = body.order.reference.split("::", 1);
		const eventEntity = await strapi.query("event").findOne({ slug });

		if (!eventEntity) {
			return ctx.response.badRequest();
		}

		const eventId = eventEntity.id;

		// find products
		const products = await strapi
			.query("product")
			.find({ reference_in: _.map(body.order.items, "reference") });
		const productIds = _.map(products, "id");

		// should maybe check options (?)
		/*
		const options = await strapi
			.query("product-option")
			.find({ reference_in: _.keys(body.options) });
		*/

		return await strapi.query("order").create({
			reference: body.order.reference,
			data: body,
			event: eventId,
			products: productIds,
		});
	},

	async update(ctx) {
		// must be guarded

		const { reference } = getIdentifier(ctx);
		if (reference) {
			const { body } = ctx.request;
			const order = await strapi.query("order").findOne({ reference });
			if (order && body) {
				const entity = _.merge(order.data, body);
				if (entity) {
					await strapi
						.query("order")
						.update({ reference }, { data: entity });
					ctx.response.status = 200;
				}

				ctx.response.status = 200;
				return;
			}
		}
		return ctx.response.badRequest();
	},
};

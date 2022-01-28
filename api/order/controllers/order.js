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

async function sendEmail(order, eventTitle) {
	await strapi.plugins["email"].services.email.send({
		to: order.data.customerData.email,
		//from: "no-reply@iare.se",
		subject: "Iare: Order reserved successfully",
		text: `This email counts as a confirmation that you have successfully RSVP to ${eventTitle}.\n\nYour reciept can be seen here: ${order.data.recieptUrl}\n\norder-reference: ${order.data.order.reference}`,
	});
}

module.exports = {
	async findReceipt(ctx) {
		const { ref } = ctx.params;
		if (ref) {
			const entity = await strapi
				.query("order")
				.findOne({ reference: ref });
			return sanitizeEntity(entity, { model: strapi.models.order });
		}
		return ctx.response.badRequest();
	},

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

		const order = {
			reference: body.order.reference,
			data: body,
			event: eventId,
			products: productIds,
		};

		if (
			!body.sentEmailConfirmation &&
			body.status.some((p) => p.status === "completed")
		) {
			sendEmail(order, eventEntity.title);
		}

		return await strapi.query("order").create(order);
	},

	async update(ctx) {
		// must be guarded

		const { reference } = getIdentifier(ctx);
		if (reference) {
			const { body } = ctx.request;
			const order = await strapi.query("order").findOne({ reference });
			if (order && body) {
				// appending statuses

				const status = _.uniqBy(
					[...order.data.status, ...body.status],
					"status"
				);
				let sentEmailConfirmation = false;
				if (
					body.status.some(
						(p) =>
							p.status === "completed" || p.status === "charged"
					) &&
					!order.data.sentEmailConfirmation
				) {
					sentEmailConfirmation = true;
				}
				const enrichedBody = { ...body, status, sentEmailConfirmation };

				let entity = _.merge(order.data, enrichedBody);

				if (entity) {
					if (
						sentEmailConfirmation &&
						order.data.customerData.email &&
						order.event
					) {
						sendEmail(order, order.event.title);
					}

					await strapi
						.query("order")
						.update({ reference }, { data: entity });
				}

				ctx.response.status = 200;
				return;
			}
		}
		return ctx.response.badRequest();
	},
};

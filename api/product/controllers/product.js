"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

async function getProductEntity(ctx) {
	const entity = await strapi.services.product.findOne({
		reference: ctx.params.ref,
	});
	if (!entity) {
		return ctx.response.badRequest();
	}
	return entity;
}

async function getEventEntity(ctx) {
	const entity = await strapi.services.event.findOne({
		slug: ctx.params.slug,
	});
	if (!entity) {
		return ctx.response.badRequest();
	}
	return entity;
}

module.exports = {
	async reserve(ctx) {
		const entity = await getProductEntity(ctx);
		const event = await getEventEntity(ctx);
		const qty = parseInt(ctx?.query?.quantity ?? 0);
		const accumulate = parseInt(ctx?.query?.accumulate ?? 0);
		const itemsLeft = parseInt(entity.stock - entity.count);

		// when a product is not a side product and the event has reached its max
		// capacity it cannot reserve more products.
		if (
			parseInt(event.accumulator) + accumulate > parseInt(event.maxCapacity)
		) {
			ctx.response.status = 403;
			return;
		}

		if (qty <= itemsLeft && entity.count <= entity.stock) {
			// accumulate capacity on main products
			if (true) {
				await strapi.query("event").update(
					{ slug: event.slug },
					{
						accumulator: parseInt(event.accumulator) + accumulate,
					}
				);
			}

			await strapi
				.query("product")
				.update(
					{ reference: ctx.params.ref },
					{ count: parseInt(entity.count) + qty }
				);
			ctx.response.status = 202;

			return;
		}
		ctx.response.status = 403;
	},

	async removecountandaccumulator(ctx) {
		const entity = await getProductEntity(ctx);
		const event = await getEventEntity(ctx);
		const qty = parseInt(ctx?.query?.quantity ?? 0);
		const itemsLeft = parseInt(entity.stock - entity.count);

		// Check if it should be able to subtract
		if (
			!entity.sideProduct &&
			parseInt(event.accumulator) - qty >= 0
		) {
			ctx.response.status = 403;
			return;
		}

		if (entity.count - qty >= 0 && entity.count >= 0) {
			// accumulate capacity on main products
			if (!entity.sideProduct) {
				await strapi.query("event").update(
					{ slug: event.slug },
					{
						accumulator: parseInt(event.accumulator) - qty,
					}
				);
			}

			await strapi
				.query("product")
				.update(
					{ reference: ctx.params.ref },
					{ count: parseInt(entity.count) - qty }
				);
			ctx.response.status = 202;

			return;
		}
		ctx.response.status = 403;
	},
};

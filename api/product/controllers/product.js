"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

async function getEntity(ctx) {
	const entity = await strapi.services.product.findOne({
		reference: ctx.params.ref,
	});
	if (!entity) {
		return ctx.response.badRequest();
	}
	return entity;
}

module.exports = {
	async reserve(ctx) {
		const entity = await getEntity(ctx);
		const qty = parseInt(ctx?.query?.quantity ?? 0);
		const itemsLeft = parseInt(entity.stock - entity.count);
		if (qty <= itemsLeft && entity.count <= entity.stock) {
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
};

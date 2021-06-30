"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const sanitizeId = (value) => {
  if (/^-?\d+$/.test(value)) return { id: value };
  return { paymentId: value };
};
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

module.exports = {
  async update(ctx) {
    const { id } = ctx.params;

    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);

      entity = await strapi.services.order.update(sanitizeId(id), data, {
        files,
      });
    } else {
      entity = await strapi.services.order.update(
        sanitizeId(id),
        ctx.request.body
      );
    }
    return sanitizeEntity(entity, { model: strapi.models.order });
  },
  async delete(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.services.order.delete(sanitizeId(id));
    return sanitizeEntity(entity, { model: strapi.models.order });
  },
};

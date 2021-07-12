"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const sanitizeId = (value) => {
  if (/^-?\d+$/.test(value)) return { id: value };
  return { intentionId: value };
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

  async details(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.order.findOne({ intentionId: id });
    return {
      tickets: entity.ticketReference,
      paymentId: entity.paymentId,
    };
  },

  async validIntention(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.order.findOne({ intentionId: id });
    return entity ? { valid: true } : { valid: false };
  },

  async updateDiets(ctx) {
    const { id } = ctx.params;
    const body = { consumer: {} };

    if (ctx.request.body.hasOwnProperty("diets"))
      body.consumer["diets"] = ctx.request.body.diets;
    if (ctx.request.body.hasOwnProperty("allergens"))
      body.consumer["allergens"] = ctx.request.body.allergens;
    const entity = await strapi.services.order.update(
      { intentionId: id },
      body
    );
    return sanitizeEntity(entity, { model: strapi.models.order });
  },

  async ticket(ctx) {
    return {};
  },
  async webhook(ctx) {
    const { paymentId } = ctx.params;
    const entity = await strapi.services.order.update(
      { paymentId },
      ctx.request.body
    );
    return sanitizeEntity(entity, { model: strapi.models.order });
  },
};

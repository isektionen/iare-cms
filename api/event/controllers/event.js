"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

const sanitizeId = (value) => {
  if (/^-?\d+$/.test(value)) return { id: value };
  return { slug: value };
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
  async findOne(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.event.findOne(sanitizeId(id));
    return sanitizeEntity(entity, { model: strapi.models.event });
  },
};

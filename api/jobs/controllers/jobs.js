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
  async findOne(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.jobs.findOne(sanitizeId(id));

    return sanitizeEntity(entity, { model: strapi.models.jobs });
  },
};

"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  async create(ctx) {
    let entity;
    entity = await strapi.services.diet.create(ctx.request.body);
    const se = sanitizeEntity(entity, { model: strapi.models.diet });
    return se;
  },
};

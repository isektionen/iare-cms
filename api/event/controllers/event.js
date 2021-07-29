"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

const sanitizeId = (value) => {
  if (/^-?\d+$/.test(value)) return { id: value };
  const v4 = new RegExp(
    /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
  );
  if (v4.test(value)) return { fullfillmentUID: value };
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
          const { isValid } = await strapi.admin.services.token.decodeJwtToken(
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
    //const admin = await isAdmin(ctx);
    const entity = await strapi.services.event.findOne(sanitizeId(id));
    //if (!admin) delete entity.tickets;
    return sanitizeEntity(entity, { model: strapi.models.event });
  },
};

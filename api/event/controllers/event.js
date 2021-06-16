"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { parseMultipartData } = require("strapi-utils");

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
          id,
          valid: password === maybePassword,
        };
      }
    }
    ctx.response.status = 400;
  },
};

"use strict";

/**
 * `is-super-admin` policy.
 */

module.exports = async (ctx, next) => {
  // Add your own logic here.
  if (ctx.state.user.role.code === "strapi-super-admin") {
    return await next();
  }

  ctx.unauthorized("You're not allowed to perform this action!");
};

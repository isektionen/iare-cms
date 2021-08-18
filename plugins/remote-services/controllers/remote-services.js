"use strict";

/**
 * remote-services.js controller
 *
 * @description: A set of functions called "actions" of the `remote-services` plugin.
 */

module.exports = {
  issueBearer: async (ctx) => {
    const { body } = ctx.request;
    const { email, password } = body;
    if (!email || !password) {
      return null;
    }
    //const user = await strapi.query('user', 'admin').findOne({email, isActive: true})
    //console.log(user)

    const [nan, user, message] =
      await strapi.admin.services.auth.checkCredentials({
        email,
        password,
      });

    if (!user) {
      return null;
    }

    const token = await strapi.plugins["users-permissions"].services.jwt.issue(
      { id: user.id },
      {
        expiresIn: "9999d",
      }
    );
    return token;
  },
};

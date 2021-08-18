"use strict";
const _ = require("lodash");
const jwt = require("jsonwebtoken");

/**
 * remote-services.js controller
 *
 * @description: A set of functions called "actions" of the `remote-services` plugin.
 */
const defaultJwtOptions = { expiresIn: "9999d" };

const getTokenOptions = () => {
  const { options, secret } = strapi.config.get("server.admin.auth", {});

  return {
    secret,
    options: _.merge(defaultJwtOptions, options),
  };
};

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
    const { options, secret } = getTokenOptions();

    const token = jwt.sign({ id: user.id }, secret, options);
    return token;
  },
};
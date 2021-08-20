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
  send: async (ctx) => {
    const { templateId } = ctx.params;
    const { body } = ctx.request;
    const { to, ...rest } = body;

    try {
      await strapi.plugins["email-designer"].services.email.sendTemplatedEmail(
        {
          to,
        },
        {
          templateId,
        },
        {
          ...rest,
        }
      );
    } catch (err) {
      strapi.log.debug("EMAIL", err);
      return ctx.badRequest(null, err);
    }
    ctx.response.status = 200;
  },
  thumbnail: async (ctx) => {
    const values = ctx.request.body;
    if (!values) {
      return ctx.badRequest();
    }
    let user = {};
    if (ctx.state.user) {
      user = ctx.state.user;
    }
    const { id, ...rest } = values;
    const res = await strapi.plugins.upload.services.upload.update(
      { id },
      { formats: { thumbnail: rest } },
      user
    );
    console.log(res);
  },
};

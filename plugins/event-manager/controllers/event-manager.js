"use strict";

/**
 * event-manager.js controller
 *
 * @description: A set of functions called "actions" of the `event-manager` plugin.
 */

const isSuperAdmin = (ctx) => {
  if (ctx.state.user && ctx.state.user.role) {
    return ctx.state.user.role.code === "strapi-super-admin";
  }
  return false;
};

const getCommittees = async (ctx) => {
  //if (isSuperAdmin(ctx)) return await strapi.query("committee").find()

  const { user } = ctx.state;
  if (user) {
    const { id } = user;
    const adminUsers = await strapi.services.committee.deepRelation({
      "adminUsers.id": id,
    });

    const users = await strapi.services.committee.deepRelation({
      "users.id": id,
    });

    return [...adminUsers, ...users];
  }
};

module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.
    ctx.send({
      message: "ok",
    });
  },
  hydrate: async (ctx) => {
    /*
    if (isSuperAdmin(ctx)) {
      const committees = strapi.query("committee").find({})
    }
    */
    const committees = await getCommittees(ctx);
    console.debug(committees);
    ctx.send(committees);
  },
};

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
    const entity = [...adminUsers, ...users];
    return entity;
  }
};

module.exports = {
  me: async (ctx) => {
    /*
    if (isSuperAdmin(ctx)) {
      const committees = strapi.query("committee").find({})
    }
    */
    const committees = await getCommittees(ctx);
    ctx.send(committees);
  },
  orders: async (ctx) => {
    const { slug } = ctx.params;
    if (slug) {
      const event = await strapi.query("event").findOne({ slug });
      if (event) {
        const orders = await strapi
          .query("order")
          .find({ event: event.id, _limit: -1 });
        return ctx.send(orders);
      }
    }
    ctx.send([]);
  },
};

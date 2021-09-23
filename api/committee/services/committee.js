"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  deepRelation(params) {
    const { id, roles } = params;
    const isSuperAdmin = roles.some((ent) => ent.code === "strapi-super-admin");

    if (isSuperAdmin) {
      return strapi
        .query("committee")
        .find({}, ["events", "events.orders", "events.orders.ticketReference"]);
    }
    return strapi
      .query("committee")
      .find({ id }, [
        "events",
        "events.orders",
        "events.orders.ticketReference",
      ]);
  },
};

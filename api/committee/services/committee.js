"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  deepRelation(params) {
    return strapi.query("committee").find(params, ["events", "events.orders"]);
  },
};

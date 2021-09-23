"use strict";

const { subDays, formatISO } = require("date-fns");

module.exports = {
  purge: async (ctx) => {
    // find all orders that are not success and 1 day old.
    const today = new Date();
    const yesterday = subDays(today, 1);
    const dateFormatted = formatISO(yesterday);
    const idArray = await strapi
      .query("order")
      .find({ created_at_lt: dateFormatted, status_nin: ["success"] });
    console.log(idArray);
  },
};

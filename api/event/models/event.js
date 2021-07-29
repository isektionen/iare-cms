"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */
const { v4: uuidv4 } = require("uuid");

const _ = require("lodash");

const getCommitteesByID = async (id) => {
  const adminUsers = await strapi.services.committee.deepRelation({
    "adminUsers.id": id,
  });

  const users = await strapi.services.committee.deepRelation({
    "users.id": id,
  });
  return [...adminUsers, ...users];
};

module.exports = {
  lifecycles: {
    async beforeCreate(data) {
      const errors = await strapi.services.event.validate(data);
      if (errors.length > 0) {
        // Strapi doesn't allow you to push multiple errors
        throw strapi.errors.badRequest(errors[0].message);
      }
      if (data.localizations.length > 0) {
        const id = data.localizations[0];
        const localeTickets = (await strapi.query("event").findOne({ id }))
          .tickets.Tickets;
        const tickets = data.tickets.Tickets;
        if (tickets.length !== localeTickets.length) {
          throw strapi.errors.badRequest(
            "Cannot have two different locales with different amount of tickets. Try 'fill in from another locale' instead"
          );
        }
        if (
          tickets.some((t, i) => t.ticketUID !== localeTickets[i].ticketUID)
        ) {
          throw strapi.errors.badRequest(
            "Some of the ticketUIDs are not equal between the locales. Try 'fill in from another locale' instead"
          );
        }
      }

      // only working with two locales
      if (data.localizations.length === 1) {
        const id = data.localizations[0];
        const otherLocale = await strapi.query("event").findOne({ id });
        // sync locales ticketUIDs
        const tickets = _.zip(
          otherLocale.tickets.Tickets,
          data.tickets.Tickets
        );
        const syncedTickets = tickets.reduce(
          (acc, [otherLocale, thisLocale]) => {
            if (otherLocale.ticketUID !== thisLocale.ticketUID) {
              return [
                ...acc,
                { ...thisLocale, ticketUID: otherLocale.ticketUID },
              ];
            }
            return [...acc, thisLocale];
          },
          []
        );
        data.tickets.Tickets = syncedTickets;
        //throw strapi.errors.badRequest("lol");
      } else {
        data.tickets.Tickets = data.tickets.Tickets.map((ticket) => ({
          ...ticket,
          ticketUID: uuidv4(),
        }));
      }
      data.fullfillmentUID = uuidv4();
    },
    async afterCreate(result, data) {
      const model = strapi.query("event").model;
      console.log(model.query("where", "id", "=", result.id));
    },

    async beforeUpdate(params, data) {},
    async afterUpdate(result, params, data) {
      console.log("UPDATING!");
    },
  },
};

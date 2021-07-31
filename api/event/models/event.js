"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */
const { v4: uuidv4 } = require("uuid");
const { sanitizeEntity } = require("strapi-utils");
const _ = require("lodash");
const { ticket } = require("../../order/controllers/order");

const createForAllLocales = async (data) => {
  const _locale = data.locale || "sv";
  const locales = (await strapi.plugins.i18n.services.locales.find())
    .map((l) => l.code)
    .filter((l) => l !== _locale);
  const { createLocalization } = strapi.controllers.event;
  await createLocalization({
    params: { id: data.id },
    is: () => false,
    request: {
      body: { ...data, locale: "en", slug: data.slug + "-en" },
    },
  });
};

const createUIDs = (result) => {
  return {
    tickets: {
      ...result.tickets,
      Tickets: result.tickets.Tickets.map((ticket) => ({
        ...ticket,
        ticketUID: uuidv4(),
      })),
    },
    fullfillmentUID: uuidv4(),
  };
};

var state = [];
var persistedIDs = [];

const syncLocales = async ({ data, result, id }) => {
  if (
    persistedIDs.includes(id) ||
    (result && persistedIDs.includes(result.id))
  ) {
    const _id = result ? result.id : id;
    persistedIDs = persistedIDs.filter((record) => record !== _id);
    return;
  }
  if (
    data &&
    result &&
    !state.some((obj) => obj.id === result.id) &&
    result.localizations
  ) {
    persistedIDs = [result.id];
    state = [
      ...state,
      {
        id: result.id,
        tickets: data.tickets.Tickets,
        locales: result.localizations.map((l) => l.id),
      },
    ];
    return;
  }
  if (id) {
    persistedIDs.push(id);
    const _state = state.find((obj) => obj.locales.includes(id));
    if (!_state) return;
    const { id: _id, tickets, locales = [] } = _state;

    state = state.filter((obj) => obj !== _state);
    const syncUIDs = (tickets, key) => {
      if (key === "null" || key === "undefined") {
        const uuid = uuidv4();
        const ticket = { ..._.first(tickets), ticketUID: uuid };
        const amount = tickets.length;
        const others = _.fill(Array(amount), {
          ..._.omit(ticket, "id", "belongsTo"),
          belongsTo: id,
        });
        return [ticket, ...others];
      }
      return tickets;
    };

    if (locales.includes(id)) {
      // match existing tickets
      console.log(tickets);
      const payload = _.chain([
        ...tickets.map((t) => ({ ...t, belongsTo: _id })),
        ...result.tickets.Tickets.map((t) => ({ ...t, belongsTo: id })),
      ])
        .groupBy("ticketUID")
        .mapValues(syncUIDs)
        .values()
        .filter((v) => v.length === locales.length + 1)
        .flatten()
        .groupBy("belongsTo")
        .toPairs()
        .value();

      const update = strapi.query("event").update;

      payload.forEach(
        async ([id, tickets]) =>
          await update(
            { id },
            {
              tickets: {
                Tickets: tickets.map((ticket) => _.omit(ticket, "belongsTo")),
              },
            }
          )
      );
    }
  }
};

module.exports = {
  lifecycles: {
    async beforeCreate(data) {
      const errors = await strapi.services.event.validate(data);
      if (errors.length > 0) {
        // Strapi doesn't allow you to push multiple errors
        throw strapi.errors.badRequest(errors[0].message);
      }

      //throw strapi.errors.badRequest("debug");
    },
    async afterCreate(result, data) {
      if (result.localizations.length === 0) {
        const uids = createUIDs(result);
        await createForAllLocales({ ...result, ...uids });
        await strapi
          .query("event")
          .update(
            { id: result.id },
            { fullfillmentUID: uids.fullfillmentUID, tickets: uids.tickets }
          );
      }
    },
    async afterUpdate(result, params, data) {
      if (_.has(data, "tickets.Tickets")) {
        await syncLocales({ data, result });
        result.tickets.Tickets = result.tickets.Tickets.map((ticket) => ({
          ...ticket,
          ticketUID: ticket.ticketUID ? ticket.ticketUID : uuidv4(),
        }));
      } else {
        await syncLocales({ result, id: params.id });
      }
    },
  },
};

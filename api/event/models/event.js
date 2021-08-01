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
/*
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
        tickets: data.tickets,
        ticketContainerId: data.id,
        locales: result.localizations.map((l) => l.id),
      },
    ];
    return;
  }
  if (id) {
    persistedIDs.push(id);
    const _state = state.find((obj) => obj.locales.includes(id));
    if (!_state) return;
    const {
      id: _id,
      tickets,
      ticketContainerId,
      locales = [],
    } = _.cloneDeep(_state);

    _.remove(state, (obj) => (obj.id = _state.id));

    const syncUIDs = (tickets, key) => {
      if (key === "null" || key === "undefined" || tickets.length === 1) {
        const _ticket = _.first(tickets);
        const uuid = _ticket.ticketUID ? _ticket.ticketUID : uuidv4();
        const ticket = { ..._ticket, ticketUID: uuid };
        const amount = tickets.length;
        const others = _.fill(Array(amount), {
          ..._.omit(ticket, "id"),
          belongsTo: id,
          container: result.tickets.id,
        });
        return [ticket, ...others];
      }
      return tickets;
    };

    if (locales.includes(id)) {
      // match existing tickets
      let payload = _.chain([
        ...tickets.map((t) => ({
          ...t,
          belongsTo: _id,
          container: ticketContainerId,
        })),
        ...result.tickets.Tickets.map((t) => ({
          ...t,
          belongsTo: id,
          container: result.tickets.id,
        })),
      ])
        .groupBy("ticketUID")
        .mapValues(syncUIDs)
        .values()
        .filter((v) => v.length === locales.length + 1)
        .flatten()
        .groupBy("belongsTo")
        .toPairs()
        .value();

      if (_.isEmpty(payload)) {
        payload = [_id, ...locales].map((i) => [i, []]);
      }
      const update = strapi.query("event").update;
      const res = await Promise.all(
        payload.map(
          async ([id, tickets]) =>
            await update(
              { id },
              {
                tickets: {
                  Tickets: tickets.map((ticket) =>
                    _.omit(ticket, "belongsTo", "container")
                  ),
                },
              }
            )
        )
      );
    }
  }
};
*/

const insertUID = (r) => ({
  ...r,
  ticketUID: r.ticketUID ? r.ticketUID : uuidv4(),
});

const getLocales = (records) => records.localizations.map((r) => r.id);

const syncLocales = async ({ data, result, id }) => {
  const update = strapi.query("event").update;
  // when state is empty, populate ticketUID for all recieved tickets
  if (result && data && !state.some((obj) => obj.eventId === result.id)) {
    console.log("add to state", result.locale);
    result.tickets.Tickets = _.map(result.tickets.Tickets, insertUID);
    state.push({
      eventId: result.id,
      tickets: result.tickets,
      locales: getLocales(result),
    });
    const _result = await update(
      { id: result.id },
      { tickets: result.tickets }
    );
    if (_result.id === result.id) {
      result = {
        ..._result,
        slug: result.slug,
        locale: result.locale,
        localizations: result.localizations,
        orders: result.orders,
      };
    }
  }
  if (id) {
    console.log("find state", result.locale);
    const _state = state.find((obj) => obj.locales.includes(id));
    // sync tickets from previous state
    _.remove(state, (obj) => obj.eventId === _state.eventId);
    if (_.isEmpty(_state)) return;

    const sync = (tickets, uid) => {
      if (["null", "undefined"].includes(uid) || tickets.length === 1) {
        // ticket(s) doesn't have a uid attached to it

        const _ticket = _.first(tickets);

        const uuid = _ticket.ticketUID ? _ticket.ticketUID : uuidv4();
        const ticket = { ..._ticket, ticketUID: uuid };
        const others = _.fill(Array(locales.length), {
          ...ticket,
          belongsTo: id,
        });
        return [ticket, ...others];
      }
      return tickets;
    };

    const { tickets = [], locales = [] } = _state;
    if (locales.includes(id)) {
      console.log("sync state", result.locale);
      const otherLocaleTickets = tickets.Tickets.map((ticket) =>
        _.omit(ticket, "id")
      );
      const localeTickets = result.tickets.Tickets.map((ticket) => ({
        ...ticket,
        belongsTo: id,
      }));

      let _data = _.chain([...otherLocaleTickets, ...localeTickets])
        .groupBy("ticketUID")
        .omitBy((v) => v.length === 1 && _.has(_.first(v), "belongsTo"))
        .mapValues(sync)
        .values()
        .flatten()
        .filter((v) => v.belongsTo === id)
        .groupBy("belongsTo")
        .toPairs()
        .value();

      const [_result] = await Promise.all(
        _data.map(
          async ([id, tickets]) =>
            await update(
              { id: Number.parseInt(id) },
              {
                tickets: {
                  id: result.tickets.id,
                  Tickets: tickets.map((ticket) => _.omit(ticket, "belongsTo")),
                },
              }
            )
        )
      );
      if (_result.id === result.id) {
        //result = _result;
      }
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
      if (
        _.chain(data).keys().isEqual(["fullfillmentUID", "tickets"]).value()
      ) {
        return;
      }
      if (_.has(data, "tickets.Tickets")) {
        /*const tickets = _.cloneDeep(
          data.tickets.Tickets.map((ticket) => ({
            ...ticket,
            ticketUID: ticket.ticketUID ? ticket.ticketUID : uuidv4(),
          }))
        );

        await syncLocales({
          data: { id: data.tickets.id, tickets },
          result,
        });
        result.tickets.Tickets = result.tickets.Tickets.map((t, i) => ({
          ...t,
          ticketUID: tickets[i].ticketUID,
        }));*/
        await syncLocales({ data, result });
      } else {
        await syncLocales({ result, id: params.id });
      }
    },
  },
};

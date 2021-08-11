"use strict";

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const _ = require("lodash");
const emailClient = require("../services/email");

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

const sanitizeId = (value) => {
  if (isNumeric(value)) return { id: value };
  return { intentionId: value };
};

const groupDiet = (dietList) =>
  dietList.reduce(
    (acc, it) => {
      if (isNumeric(it.id)) {
        return { ...acc, old: [...acc.old, { ...it, id: parseInt(it.id) }] };
      }
      return { ...acc, new: [...acc.new, it] };
    },
    { new: [], old: [] }
  );

const createDiets = async (dietType, body) => {
  if (!body || (body && !body.hasOwnProperty(dietType))) return [];

  const singularType = dietType === "allergens" ? "allergy" : "diet";
  const diets = groupDiet(body[dietType]);
  const newDiets = await strapi.services[singularType].bulkCreate({
    [dietType]: diets.new.map((diet) => ({ name: diet.name })),
  });
  return [
    ...diets.old.map((diet) => diet.id),
    ...newDiets.map((diet) => diet.id),
  ];
};

const addAttribute = (body, dietType, dietList) => {
  if (dietList.length > 0) {
    body[dietType] = dietList;
  }
};

const parseDiets = async (body) => {
  const diets = await createDiets("diets", body);
  const allergens = await createDiets("allergens", body);
  const returnBody = {};
  addAttribute(returnBody, "diets", diets);
  addAttribute(returnBody, "allergens", allergens);
  return returnBody;
};

module.exports = {
  async update(ctx) {
    const { id } = ctx.params;
    const body = { ...ctx.request.body };
    const parsedDiets = await parseDiets(ctx.request.body);
    body.consumer = {
      ...body.consumer,
      ...parsedDiets,
    };
    let entity;
    entity = await strapi.services.order.update(sanitizeId(id), body);

    if (body.status === "success" && body.paymentMethod === "FREE") {
      const orderId = entity.reference;
      const intentionId = entity.intentionId;
      const eventName = entity.event.title;
      const eventStartTime = entity.event.startTime;
      const firstName = body.consumer.firstName;
      const lastName = body.consumer.lastName;
      const email = entity.consumer.email;
      const amount = 0;
      await emailClient.send({
        orderId,
        intentionId,
        eventName,
        eventStartTime,
        firstName,
        lastName,
        email,
        amount,
      });
    }
    return sanitizeEntity(entity, { model: strapi.models.order });
  },
  async delete(ctx) {
    const { id } = ctx.params;
    const entity = await strapi.services.order.delete(sanitizeId(id));
    return sanitizeEntity(entity, { model: strapi.models.order });
  },

  async details(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.order.findOne({ intentionId: id });
    return {
      tickets: entity.ticketReference,
      paymentId: entity.paymentId,
    };
  },

  async validIntention(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.order.findOne({ intentionId: id });
    //const eventEntity = await strapi.query("event").findOne({id: entity.event.id})
    //return entity ? { valid: true } : { valid: false };
    return {
      intentionId: entity?.intentionId ?? null,
      paymentId: entity?.paymentId ?? null,
      ticketId:
        entity?.ticketReference[0]?.uid ??
        entity?.event?.tickets?.Tickets[0].ticketUID ??
        null,
    };
  },

  async updateDiets(ctx) {
    const { id } = ctx.params;
    const body = { consumer: {} };

    // Check if new diets have been added
    body.consumer = parseDiets(ctx.request.body);

    console.log(body);

    const entity = await strapi.services.order.update(
      { intentionId: id },
      body
    );
    return sanitizeEntity(entity, { model: strapi.models.order });
  },

  async ticket(ctx) {
    return;
  },
  async validateTicket(ctx) {
    const { intentionId } = ctx.params;

    let entity = await strapi.services.order.findOne({
      intentionId,
      checkedInAt: null,
    });
    let alreadyUsed = false;
    if (entity) {
      entity = await strapi.services.order.update(
        { intentionId },
        { checkedInAt: new Date() }
      );
    } else {
      alreadyUsed = true;
    }
    ctx.response.body = {
      valid: alreadyUsed,
      checkedInAt: entity.checkedInAt,
      consumer: entity.consumer,
      tickets: entity.ticketReference.map((t) => _.omit(t, "uid")),
      status: entity.status,
    };
  },
  async webhook(ctx) {
    const { paymentId } = ctx.params;
    const event = _.cloneDeep(ctx.request.body.event);
    delete ctx.request.body.event;

    try {
      if (event === "payment.checkout.completed") {
        const { consumer, amount } = ctx.request.body;
        const order = await strapi.query("order").findOne({ paymentId });
        if (!order) throw new Error("no order found");
        const eventName = order.event.title;
        const eventStartTime = order.event.startTime;
        const intentionId = order.intentionId;

        const firstName = consumer.firstName;
        const lastName = consumer.lastName;

        const email = consumer.email;

        await emailClient.send({
          orderId: paymentId,
          intentionId,
          eventName,
          eventStartTime,
          firstName,
          lastName,
          email,
          amount,
        });
      }
    } catch (err) {
      strapi.log.debug(err);
    }

    const entity = await strapi.services.order.update(
      { paymentId },
      ctx.request.body
    );
    return sanitizeEntity(entity, { model: strapi.models.order });
  },
};

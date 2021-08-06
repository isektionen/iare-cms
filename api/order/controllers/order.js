"use strict";

const { getDate, format } = require("date-fns");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const _ = require("lodash");

const sanitizeId = (value) => {
  if (isNumeric(value)) return { id: value };
  return { intentionId: value };
};
function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

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

const createDiets = async (dietType, { consumer }) => {
  if (!consumer || (consumer && !consumer.hasOwnProperty(dietType))) return [];

  const singularType = dietType === "allergens" ? "allergy" : "diet";
  const diets = groupDiet(consumer[dietType]);
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

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

module.exports = {
  async update(ctx) {
    const { id } = ctx.params;
    const body = { ...ctx.request.body };
    console.log("body", body);
    const parsedDiets = await parseDiets(ctx.request.body);
    body.consumer = {
      ...body.consumer,
      ...parsedDiets,
    };
    let entity;
    entity = await strapi.services.order.update(sanitizeId(id), body);
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
    return entity ? { valid: true } : { valid: false };
  },

  async updateDiets(ctx) {
    const { id } = ctx.params;
    const body = { consumer: {} };

    // Check if new diets have been added
    if (ctx.request.body.consumer) {
      body.consumer = parseDiets(ctx.request.body);
    }

    const entity = await strapi.services.order.update(
      { intentionId: id },
      body
    );
    return sanitizeEntity(entity, { model: strapi.models.order });
  },

  async ticket(ctx) {
    return await strapi.services.order.createQRCode("TICKET INFO");
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
      if (event === "payment.charge.created.v2") {
        const paymentMethod = _.pick(ctx, "ctx.request.body.paymentMethod");
        const paymentType = _.pick(ctx, "ctx.request.body.paymentType");
        const timestamp = _.pick(ctx, "ctx.request.body.timestamp");

        const order = await strapi.query("order").findOne({ paymentId });
        if (!order) throw new Error("no order found");

        const eventName = _.pick(order, "event.title");
        const eventStartTime = _.pick(order, "event.startTime");
        const amount = _.pick(order, "event.amount");
        const intentionId = _.pick(order, "event.intentionId");

        const consumer = _.pick(order, "consumer");
        const firstName = consumer.firstName;
        const email = consumer.email;

        await strapi.plugins[
          "email-designer"
        ].services.email.sendTemplatedEmail(
          {
            to: email,
          },
          {
            templateId: 1,
            subject: `Iare: order receipt`,
          },
          {
            QRCode: await strapi.services.order.createQRCode(
              /*strapi.backendUrl + "orders/validation/" + */ intentionId
            ),
            header: `We hope you will have fun at ${eventName}, ${firstName}!`,
            startTimeDescription: `${eventName} will start at ${format(
              new Date(eventStartTime),
              "hha..aa, EEEE dd mm"
            )}`,
            orderSummaryHeader: "Order summary",
            dateLabel: "Date",
            date: format(new Date(), "dd MMM yyyy"),
            orderIdLabel: "Order ID",
            orderId: paymentId,
            paymentMethodLabel: "Payment Method",
            paymentMethod: `${paymentMethod} [${paymentType}]`,
            totalLabel: "Total",
            total: amount + " kr",
          }
        );
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

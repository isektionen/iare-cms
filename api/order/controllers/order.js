"use strict";

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
    return {};
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
    console.log("weebhook", ctx.request.body);
    const entity = await strapi.services.order.update(
      { paymentId },
      ctx.request.body
    );
    return sanitizeEntity(entity, { model: strapi.models.order });
  },
};

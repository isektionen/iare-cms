/*module.exports = {
  resolver: {
    Query: {
      orders: false,
      order: false,
    },
  },
};*/
module.exports = {
  resolver: {
    Query: {
      orders: false,
      order: false,
      ordersCount: {
        description: "Return the count of orders",
        resolverOf: "application::order.order.details",
        resolver: async (obj, options, ctx) => {
          const event = await strapi
            .query("event")
            .findOne({ slug: options.slug });
          const where = { event: event.id, status: "success" };
          return await strapi.query("order").count(where);
        },
      },
    },
  },
  query: `ordersCount(where: JSON): Int`,
};

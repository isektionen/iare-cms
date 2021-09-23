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
        resolverOf: "application::order.order.find",
        resolver: async (obj, options, ctx) => {
          const where = { event: options.where.event, status: "success" };
          return await strapi.query("order").count(where);
        },
      },
    },
  },
  query: `ordersCount(where: JSON): Int`,
};

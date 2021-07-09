module.exports = {
  query: `eventBySlug(slug: String!): Event`,
  resolver: {
    Query: {
      eventBySlug: {
        description: "Return a single event by slug",
        resolver: "application::event.event.findOneBySlug",
      },
    },
  },
};

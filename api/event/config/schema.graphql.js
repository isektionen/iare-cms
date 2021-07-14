module.exports = {
  /*definition: `
  type Event {
    id: ID!
    created_at: DateTime!
    updated_at: DateTime!
    title: String!
    slug: String
    committee: Committee
    tickets: ComponentEventTickets
    servingOptions: ComponentEventServing
    studentOptions: ComponentEventStudent
    startTime: DateTime!
    endTime: DateTime!
    deadline: DateTime!
    description: String!
    place: ComponentEventPlace
    passwordProtected: ComponentEventPasswordProtect
    locale: String
    published_at: DateTime!
    localizations: [Event]
  }`,
  type: {
    Event: {
      orders: false,
    },
  },
  */
  query: `
  eventBySlug(slug: String!): Event
  `,
  resolver: {
    Query: {
      eventBySlug: {
        description: "Return a single event by slug",
        resolver: "application::event.event.findOneBySlug",
      },
    },
  },
};

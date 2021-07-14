module.exports = {
  definition: `
  type OATComponentEventTicketReference {
    reference: String
    price: Float
  }
    type OATCommittee {
      name: String!
    }
    type OATPlace {
      name: String!
    }
    type OATEvent {
      title: String!
      startTime: DateTime!
      endTime: DateTime!
      committee: OATCommittee
      place: OATPlace
    }
    type OrderAsTicket {
      status: ENUM_ORDER_STATUS,
      consumer: ComponentEventRecipient,
      event: OATEvent
      ticketReference: [OATComponentEventTicketReference]
      reference: String
    }
  `,
  query: "orderAsTicket(intentionId: String!): OrderAsTicket",
  resolver: {
    Query: {
      orderAsTicket: {
        description: "Return a single order as a ticket",
        resolverOf: "application::order.order.ticket",
        resolver: async (obj, options, { context }) => {
          // obj is the object being built
          // options are the params

          const entity = await strapi.services.order.findOne({
            intentionId: options.intentionId,
          });

          if (entity.event.committee) {
            committee = await strapi.services.committee.findOne({
              id: entity.event.committee,
            });
            entity.event.committee = committee;
          }
          return entity || "No ticket found";
        },
        //resolver: "application::order.order.ticket",
      },
    },
  },
};

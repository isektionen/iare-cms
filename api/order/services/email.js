const { format } = require("date-fns");

module.exports = {
  async send({
    orderId,
    intentionId,
    eventName,
    eventStartTime,
    firstName,
    lastName,
    email,
    amount,
  }) {
    const baseUrl = "https://cms.iare.se";
    await strapi.plugins["email-designer"].services.email.sendTemplatedEmail(
      {
        to: email,
      },
      {
        templateId: 1,
        subject: `Iare: order receipt`,
      },
      {
        QRCode: await strapi.services.order.createQRCode(
          baseUrl + "/orders/validation/" + intentionId
        ),
        header: `We hope you will have fun at ${eventName}, ${firstName}!`,
        startTimeDescription: `${eventName} will start at ${format(
          new Date(eventStartTime),
          "HH, EEEE dd mm"
        )}`,
        orderSummaryHeader: "Order summary",
        dateLabel: "Date",
        date: format(new Date(), "dd MMM yyyy"),
        orderIdLabel: "Order ID",
        orderId: orderId,
        customerLabel: "Customer",
        customer: `${firstName} ${lastName}`,
        totalLabel: "Total",
        total: amount + " kr",
      }
    );
  },
};

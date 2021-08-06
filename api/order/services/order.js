"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */
const qrSvg = require("./svg");

module.exports = {
  async createQRCode(data) {
    const qr = qrSvg(4, "M");
    qr.addData(data);

    qr.make();

    return qr.createWithLogo(50);
  },
};

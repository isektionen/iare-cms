"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

const datefn = require("date-fns");

const isAfter = (date, dateToCompare) => {
	return datefn.isAfter(new Date(date), new Date(dateToCompare));
};

const isBefore = (date, dateToCompare) => {
	return datefn.isBefore(new Date(date), new Date(dateToCompare));
};

module.exports = {
	validate(data) {},
};

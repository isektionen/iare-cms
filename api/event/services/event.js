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
  validate(data) {
    let errors = [];
    // Every event needs to have atleast 1 type of ticket
    if (!data.tickets || data?.tickets?.Tickets.length === 0) {
      errors.push({
        type: "no-tickets",
        message: "Add atleast one (1) ticket!",
      });
    }
    // Validate datetimes
    if (data.startTime && data.endTime) {
      if (isAfter(data.startTime, data.endTime)) {
        errors.push({
          type: "starttime-after-endtime",
          message: "Starting time is greater than ending time!",
        });
      }
    }
    if (data.startTime && data.deadline) {
      if (isBefore(data.startTime, data.deadline)) {
        errors.push({
          type: "deadline-after-starttime",
          message: "Deadline is greater than starting time",
        });
      }
    }
    if (data.endTime && data.deadline) {
      if (isBefore(data.endTime, data.deadline)) {
        errors.push({
          type: "deadline-after-endtime",
          message: "Deadline is greater than ending time",
        });
      }
    }
    // validate that relations are set
    if (!data.committee) {
      errors.push({
        type: "missing-committee-relation",
        message: "No committee relation found!",
      });
    }
    return errors;
  },
};

"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const getCommitteesByID = async (id) => {
  const adminUsers = await strapi.services.committee.deepRelation({
    "adminUsers.id": id,
  });

  const users = await strapi.services.committee.deepRelation({
    "users.id": id,
  });
  return [...adminUsers, ...users];
};

module.exports = {
  lifecycles: {
    async beforeCreate(data) {
      const errors = await strapi.services.event.validate(data);
      if (errors.length > 0) {
        // Strapi doesn't allow you to push multiple errors
        throw strapi.errors.badRequest(errors[0].message);
      }
    },
    async afterCreate(result, data) {
      if (!result.committee) {
        const { id } = result.created_by;
        const committees = await getCommitteesByID(id);
        if (committees.length > 0) {
          // TODO: find a nicer solution to auto-appending a committee when none was added
          await strapi.query("event").update(
            { id: result.id },
            {
              committee: committees[0].id,
            }
          );
        }
      }
    },
  },
};

"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async bulkCreate(data, { files } = {}) {
    const { allergens } = data;
    return await Promise.all(
      allergens.map(async (allergy) => {
        const validAllergy =
          await strapi.entityValidator.validateEntityCreation(
            strapi.models.allergy,
            allergy
          );
        if (validAllergy) {
          let entry;
          validAllergy.published_at = null;
          const existingEntry = await strapi
            .query("allergy")
            .findOne({ name: validAllergy.name });
          if (existingEntry) {
            // updating drafted entry
            validAllergy.count = existingEntry.count + 1;

            if (validAllergy.count >= 10) {
              // by giving a published_at attribute, strapi will automatically publish it
              validAllergy.published_at = new Date();
            }
            entry = strapi
              .query("allergy")
              .update({ name: validAllergy.name }, validAllergy);
          } else {
            entry = strapi.query("allergy").create(validAllergy);
          }

          return entry;
        }
      })
    );
  },
};

"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async bulkCreate(data, { files } = {}) {
    const { diets } = data;
    const validDiets = await Promise.all(
      diets.map(async (diet) => {
        const validDiet = await strapi.entityValidator.validateEntityCreation(
          strapi.models.diet,
          diet
        );
        if (validDiet) {
          let entry;
          validDiet.published_at = null;
          const existingEntry = await strapi
            .query("diet")
            .findOne({ name: validDiet.name });
          if (existingEntry) {
            // updating drafted entry
            validDiet.count = existingEntry.count + 1;

            if (validDiet.count >= 10) {
              // by giving a published_at attribute, strapi will automatically publish it
              validDiet.published_at = new Date();
            }
            entry = strapi
              .query("diet")
              .update({ name: validDiet.name }, validDiet);
          } else {
            entry = strapi.query("diet").create(validDiet);
          }

          return entry;
        }
      })
    );
    return validDiets;
  },
};

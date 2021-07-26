"use strict";

module.exports = async () => {
  const actions = [
    {
      section: "plugins",
      displayName: "Access the Event Manager",
      uid: "read",
      pluginName: "event-manager",
    },
  ];

  const { actionProvider } = strapi.admin.services.permission;
  await actionProvider.registerMany(actions);
};

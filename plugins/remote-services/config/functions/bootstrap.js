"use strict";

module.exports = async () => {
  const actions = [
    {
      section: "plugins",
      displayName: "Send emails",
      uid: "read",
      pluginName: "remote-services",
    },
    {
      section: "plugins",
      displayName: "Update media",
      uid: "update",
      pluginName: "remote-services",
    },
  ];

  const { actionProvider } = strapi.admin.services.permission;
  await actionProvider.registerMany(actions);
};

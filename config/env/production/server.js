module.exports = ({ env }) => ({
  url: env("BACKEND_URL"),
  admin: {
    autoOpen: env.bool("ADMIN_AUTO_OPEN", false),
  },
});

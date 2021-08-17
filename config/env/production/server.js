module.exports = ({ env }) => ({
  host: "0.0.0.0",
  url: env("BACKEND_URL"),
  port: env.int("PORT", 1337),
  admin: {
    url: "/",
    autoOpen: env.bool("ADMIN_AUTO_OPEN", false),
    auth: {
      secret: env("ADMIN_JWT_SECRET", "1438656bfa7261c4ba88e07fde3039b7"),
    },
  },
});

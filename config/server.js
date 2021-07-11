module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  //url: env("BACKEND_URL", "/"),
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "1438656bfa7261c4ba88e07fde3039b7"),
    },
    //url: env("PUBLIC_ADMIN_URL", "/admin"),
    //serveAdminPanel: env.bool("SERVE_ADMIN", true),
  },
});

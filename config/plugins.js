module.exports = ({ env }) => ({
  email: {
    provider: "gmail-2lo",
    providerOptions: {
      username: "webmaster@iare.nu",
      clientId: env("EMAIL_CLIENT_ID"),
      privateKey: env("EMAIL_PRIVATE_KEY").replace(/\\n/g, "\n"),
    },
    settings: {
      defaultFrom: "webmaster@iare.nu",
      defaultReplyTo: "webmaster@iare.nu",
    },
  },
});

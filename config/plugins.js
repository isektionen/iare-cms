module.exports = ({ env }) => ({
  email: {
    provider: "gmail-2lo",
    providerOptions: {
      username: "no-reply@iare.se",
      clientId: env("EMAIL_CLIENT_ID"),
      privateKey: env("EMAIL_PRIVATE_KEY").replace(/\\n/g, "\n"),
    },
    settings: {
      defaultFrom: "no-reply@iare.se",
      defaultReplyTo: "no-reply@iare.se",
    },
  },
});

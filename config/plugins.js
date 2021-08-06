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
  "email-designer": {
    editor: {
      tools: {
        heading: {
          properties: {
            text: {
              value: "This is the new default text!",
            },
          },
        },
      },
      options: {
        features: {
          colorPicker: {
            presets: ["#D9E3F0", "#F47373", "#697689", "#37D67A"],
          },
        },
        fonts: {
          showDefaultFonts: false,
          customFonts: [
            {
              label: "Anton",
              value: "'Anton', sans-serif",
              url: "https://fonts.googleapis.com/css?family=Anton",
            },
            {
              label: "Lato",
              value: "'Lato', Tahoma, Verdana, sans-serif",
              url: "https://fonts.googleapis.com/css?family=Lato",
            },
            // ...
          ],
        },
        mergeTags: [
          {
            name: "Email",
            value: "{{= USER.username }}",
            sample: "john@doe.com",
          },
          // ...
        ],
      },
      appearance: {
        theme: "dark",
        panels: {
          tools: {
            dock: "left",
          },
        },
      },
    },
  },
});

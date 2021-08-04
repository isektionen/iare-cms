module.exports = ({ env }) => ({
  upload: {
    provider: "aws-s3",
    providerOptions: {
      accessKeyId: env("AWS_ACCESS_KEY_ID"),
      secretAccessKey: env("AWS_ACCESS_SECRET"),
      region: env("AWS_S3_REGION"),
      params: {
        Bucket: env("AWS_S3_BUCKET_NAME"),
      },
    },
  },
  graphql: {
    endpoint: "/graphql",
    shadowCRUD: true,
    playgroundAlways: true,
    depthLimit: 7,
    amountLimit: 100,
    apolloServer: {
      tracing: false,
    },
  },
  email: {
    provider: "gmail-2lo",
    providerOptions: {
      username: "no-reply@indek.se",
      clientId: env("EMAIL_CLIENT_ID"),
      privateKey: env("EMAIL_PRIVATE_KEY").replace(/\\n/g, "\n"),
    },
    settings: {
      defaultFrom: "no-reply@indek.se",
      defaultReplyTo: "no-reply@indek.se",
    },
  },
});

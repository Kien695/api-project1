module.exports = {
  apps: [
    {
      name: "ApiEcomerce",
      script: "index.js",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};

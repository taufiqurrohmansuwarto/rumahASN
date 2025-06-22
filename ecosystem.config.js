module.exports = {
  apps: [
    {
      name: "Rumah ASN",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: "8",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 3088,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3088,
      },
    },
  ],
};

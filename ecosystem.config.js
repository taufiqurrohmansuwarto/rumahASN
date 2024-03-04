module.exports = {
  apps: [
    {
      name: "next-app",
      script: "npm",
      args: "start",
      watch: ".",
      // Instances to 0 will auto-detect the number of available CPU cores
      instances: 0,
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

module.exports = {
  apps: [
    {
      name: "Rumah ASN",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: "4",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 3088,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3088,
      },
      max_memory_restart: "1G", // agar auto-restart jika bocor memori
      error_file: "/var/log/pm2/rumah-asn-api-error.log",
      out_file: "/var/log/pm2/rumah-asn-api-out.log",
      merge_logs: true,
      time: true, // agar log punya timestamp
    },
  ],
};

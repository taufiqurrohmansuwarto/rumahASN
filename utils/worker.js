const Minio = require("minio");
import { signAndSaveToMinio } from "./esign";
import { signAndSaveQueue } from "./queue";

const minioConfig = {
  port: parseInt(process.env.MINIO_PORT),
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  endPoint: process.env.MINIO_ENDPOINT,
};

const mc = new Minio.Client(minioConfig);

signAndSaveQueue.process(async (job) => {
  try {
    console.log("proses");
    const result = await signAndSaveToMinio({ mc, ...job.data });
    return result;
  } catch (error) {
    throw error;
  }
});

console.log("Worker started");

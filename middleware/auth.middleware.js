import axios from "axios";
import { getSession } from "next-auth/react";
const User = require("../models/users.model");
const Minio = require("minio");

const minioConfig = {
  port: parseInt(process.env.MINIO_PORT),
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  endPoint: process.env.MINIO_ENDPOINT,
};

const mc = new Minio.Client(minioConfig);

const auth = async (req, res, next) => {
  try {
    const data = await getSession({ req });
    if (data) {
      const userId = data?.user?.id?.split("|")?.[1];
      const customId = data?.user?.id;

      const result = await User.query().where("custom_id", customId).first();
      const currentUser = {
        ...data?.user,
        userId: parseInt(userId),
        customId,
        current_role: result?.current_role,
        ...result,
      };

      req.user = currentUser;

      req.fetcher = axios.create({
        baseURL: process.env.APIGATEWAY_URL,
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });

      req.mc = mc;
      next();
    } else {
      res.status(401).json({ code: 401, message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
  }
};

export default auth;

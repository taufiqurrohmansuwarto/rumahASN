import axios from "axios";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "pages/api/auth/[...nextauth]";
const User = require("../models/users.model");
const Minio = require("minio");

const bannedUserId = ["100549038920214179600"];

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
    const data = await unstable_getServerSession(req, res, authOptions);
    if (data) {
      const userId = data?.user?.id?.split("|")?.[1];
      const customId = data?.user?.id;

      if (bannedUserId.includes(customId)) {
        res.status(401).json({ code: 401, message: "Unauthorized" });
      }

      const result = await User.query()
        .where("custom_id", customId)
        .first()
        .withGraphFetched("app_role");

      const currentUser = {
        ...data?.user,
        userId: parseInt(userId),
        customId,
        current_role: result?.current_role,
        ...result,
      };

      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress ||
        "unknown";

      console.log(ip);

      req.user = currentUser;
      req.ip = ip;

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

import axios from "axios";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "pages/api/auth/[...nextauth]";

require("dotenv").config();

const User = require("../models/users.model");
const Minio = require("minio");

const useSSL = process.env.NODE_ENV === "production";

const bannedUserId = ["100549038920214179600"];

const minioConfig = {
  port: parseInt(process.env.MINIO_PORT),
  useSSL,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  endPoint: process.env.MINIO_ENDPOINT,
};

const mc = new Minio.Client(minioConfig);

const updateUserRole = (currentUser) => {
  const { id, organization_id, role, current_role, group, custom_id } =
    currentUser;
  const isBKDOrg = organization_id?.startsWith("123");
  const isPTTPKOrg = organization_id?.startsWith("134");
  const isAdminHelpdesk = custom_id === "master-fasilitator|bkdhelpdesk";
  const isPrakom = custom_id === "master|56543";

  const shouldBeAdmin =
    (isAdminHelpdesk &&
      isBKDOrg &&
      role === "FASILITATOR" &&
      group === "MASTER") ||
    isPrakom;
  const shouldBeAgent =
    (isBKDOrg &&
      role === "USER" &&
      group === "MASTER" &&
      current_role !== "admin") ||
    (isPTTPKOrg &&
      role === "USER" &&
      group === "PTTPK" &&
      current_role !== "admin");
  const shouldBeUser =
    (role === "FASILITATOR" && group === "MASTER") ||
    group === "GOOGLE" ||
    group === "PTTPK";

  if (shouldBeAdmin) {
    return "admin";
  } else if (shouldBeAgent) {
    return "agent";
  } else if (shouldBeUser) {
    return "user";
  } else {
    return null;
  }
};

const auth = async (req, res, next) => {
  try {
    const data = await unstable_getServerSession(req, res, authOptions);
    if (data) {
      const userId = data?.user?.id?.split("|")?.[1];
      const customId = data?.user?.id;

      if (bannedUserId.includes(customId)) {
        return res.status(401).json({ code: 401, message: "Unauthorized" });
      }

      const result = await User.query()
        .where("custom_id", customId)
        .first()
        .withGraphFetched("app_role");

      const newRole = updateUserRole(result);

      if (newRole) {
        await User.query().findById(customId).patch({ current_role: newRole });
      }

      const lastResult = await User.query()
        .where("custom_id", customId)
        .first()
        .withGraphFetched("app_role");

      const currentUser = {
        ...data?.user,
        userId: parseInt(userId),
        customId,
        current_role: lastResult?.current_role,
        ...lastResult,
      };

      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress ||
        "unknown";

      req.user = currentUser;
      req.ip = ip;

      req.fetcher = axios.create({
        baseURL: process.env.APIGATEWAY_URL,
        timeout: 60000, // 1 menit
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });

      req.mc = mc;
      next();
    } else {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

export default auth;

const { createRedisInstance } = require("@/utils/redis");
import axios from "axios";

const dmsMiddleware = async (req, res, next) => {
  try {
    const redis = await createRedisInstance();
    const token = await redis.get("bknsiasn:access_token");
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
    }
    req.dmsFetcher = axios.create({
      baseURL: "https://api-siasn-internal.bkn.go.id/dms/api",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = dmsMiddleware;

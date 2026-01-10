const { createRedisInstance } = require("@/utils/redis");

module.exports = async (req, res, next) => {
  try {
    const redis = await createRedisInstance();
    const token = await redis.get("bknsiasn:access_token");
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
    }
    req.token = token;
    next();
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

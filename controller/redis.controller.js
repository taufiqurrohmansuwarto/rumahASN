const { createRedisInstance } = require("@/utils/redis");

// get all redis keys
export const getAllRedisKeys = async (req, res) => {
  const redis = createRedisInstance();
  try {
    const keys = await redis.keys("*");

    const data = keys.map((key) => ({
      key,
    }));
    res.json(data);
  } catch (error) {
    console.error("Error getting all redis keys:", error);
    res.status(500).json({ message: "Internal server error" });
  }
  // ✅ No redis.quit() - connection reused
};

// get redis key by id
export const getRedisKeyById = async (req, res) => {
  const redis = createRedisInstance();
  try {
    const id = req.query.id;
    const key = await redis.get(id);
    res.json(JSON.parse(key));
  } catch (error) {
    console.error("Error getting redis key by id:", error);
    res.status(500).json({ message: "Internal server error" });
  }
  // ✅ No redis.quit() - connection reused
};

// delete redis key by id
export const deleteRedisKeyById = async (req, res) => {
  const redis = createRedisInstance();
  try {
    const id = req.query.id;
    await redis.del(id);
    res.json({ message: "Redis key deleted" });
  } catch (error) {
    console.error("Error deleting redis key by id:", error);
    res.status(500).json({ message: "Internal server error" });
  }
  // ✅ No redis.quit() - connection reused
};

// delete all redis keys
export const deleteAllRedisKeys = async (req, res) => {
  const redis = createRedisInstance();
  try {
    await redis.flushall();
    res.json({ message: "All Redis keys deleted" });
  } catch (error) {
    console.error("Error deleting all redis keys:", error);
    res.status(500).json({ message: "Internal server error" });
  }
  // ✅ No redis.quit() - connection reused
};

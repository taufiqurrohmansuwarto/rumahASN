const { createRedisInstance } = require("@/utils/redis");

// get all redis keys
export const getAllRedisKeys = async (req, res) => {
  const redis = await createRedisInstance();
  const keys = await redis.keys("*");
  const data = keys.map((key) => ({
    key,
  }));
  res.json(data);
};

// get redis key by id
export const getRedisKeyById = async (req, res) => {
  const redis = await createRedisInstance();
  const id = req.query.id;
  const key = await redis.get(id);
  res.json(JSON.parse(key));
};

// delete redis key by id
export const deleteRedisKeyById = async (req, res) => {
  const redis = await createRedisInstance();
  const id = req.query.id;
  await redis.del(id);
  res.json({ message: "Redis key deleted" });
};

// delete all redis keys
export const deleteAllRedisKeys = async (req, res) => {
  const redis = await createRedisInstance();
  await redis.flushall();
  res.json({ message: "All Redis keys deleted" });
};

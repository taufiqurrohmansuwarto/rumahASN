const RefJFTSiasn = require("@/models/ref_siasn/jft.model");
const RefJFUSiasn = require("@/models/ref_siasn/jfu.model");
const SubJabatanSiasn = require("@/models/ref_siasn/sub-jabatan.model");
const { createRedisInstance } = require("@/utils/redis");

// Fungsi helper untuk mengambil data dari cache Redis
const getDataFromCache = async (redis, key, fetchFunction) => {
  try {
    let data = await redis.get(key);
    if (!data) {
      data = await fetchFunction();
      await redis.set(key, JSON.stringify(data), "EX", 3600);
    } else {
      data = JSON.parse(data);
    }
    return data;
  } catch (error) {
    console.error(`Error getting data from cache: ${error.message}`);
    throw error;
  }
};

// Fungsi helper untuk query database
const queryDatabase = async (model, options = {}) => {
  try {
    const { orderBy = "nama", direction = "asc" } = options;
    return await model.query().select("*").orderBy(orderBy, direction);
  } catch (error) {
    console.error(`Error querying database: ${error.message}`);
    throw error;
  }
};

// Handler untuk mendapatkan referensi JFT
export const getRefJftV2 = async (req, res) => {
  try {
    const redis = await createRedisInstance();
    const refJft = await getDataFromCache(redis, "ref-jft-v2", () =>
      queryDatabase(RefJFTSiasn)
    );
    res.status(200).json(refJft);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data JFT" });
  }
};

// Handler untuk mendapatkan referensi JFU
export const getRefJfuV2 = async (req, res) => {
  try {
    const redis = await createRedisInstance();
    const refJfu = await getDataFromCache(redis, "ref-jfu-v2", () =>
      queryDatabase(RefJFUSiasn)
    );
    res.status(200).json(refJfu);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data JFU" });
  }
};

// Handler untuk mendapatkan sub jabatan
export const getSubJabatanV2 = async (req, res) => {
  try {
    const redis = await createRedisInstance();
    const { fungsional_id } = req?.query;

    if (!fungsional_id) {
      return res.json(null);
    }

    const fetchSubJabatan = async () => {
      const currentFungsional = await RefJFTSiasn.query()
        .findById(fungsional_id)
        .select("kel_jabatan_id");

      if (!currentFungsional) {
        throw new Error("Jabatan fungsional tidak ditemukan");
      }

      return await SubJabatanSiasn.query()
        .where("kel_jabatan_id", currentFungsional.kel_jabatan_id)
        .select("*")
        .orderBy("nama", "asc");
    };

    const subJabatan = await getDataFromCache(
      redis,
      `sub-jabatan-v2:${fungsional_id}`,
      fetchSubJabatan
    );
    res.json(subJabatan);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data sub jabatan" });
  }
};

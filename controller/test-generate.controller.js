import { cachedDataPegawai } from "@/utils/cached-data";
import { createRedisInstance } from "@/utils/redis";

export const testGenerate = async (req, res) => {
  try {
    const { fetcher: masterFetcher, siasnRequest: siasnFetcher } = req;
    const employeeNumber = req.user.employee_number;

    const redis = await createRedisInstance();

    // remove all redis data
    await redis.del(`data-pegawai-${employeeNumber}`);

    const dataPegawai = await redis.call(
      "JSON.GET",
      `data-pegawai-${employeeNumber}`,
      "$"
    );

    console.log(dataPegawai);

    if (!dataPegawai) {
      const result = await cachedDataPegawai(
        masterFetcher,
        siasnFetcher,
        employeeNumber
      );

      // caching 1 hour
      await redis
        .pipeline()
        .call(
          "JSON.SET",
          `data-pegawai-${employeeNumber}`,
          "$",
          JSON.stringify(result)
        )
        // 15 second
        .expire(15)
        .exec();
      res.json(result);
    } else {
      res.json(JSON.parse(dataPegawai));
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

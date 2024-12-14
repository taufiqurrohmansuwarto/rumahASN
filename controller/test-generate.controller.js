import { cachedDataPegawai } from "@/utils/cached-data";
import { createRedisInstance } from "@/utils/redis";
import OpenAI from "openai";

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

export const testChatCompletion = async (req, res) => {
  try {
    const openai = new OpenAI();
    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Bagaimana cara menghitung gaji?" }],
      stream: true,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        res.write(text);
      }
    }
    res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

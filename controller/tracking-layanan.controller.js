// siasn
const User = require("@/models/users.model");
const { cekPencantumanGelar } = require("@/utils/siasn-utils");

// pemberhentian
const listLayananSIASN = [
  "kenaikan-pangkat",
  "pemberhentian",
  "skk",
  "pmk",
  "pg",
];

const listLayananMaster = [];

const layananTrackingSiasn = async (req, res) => {
  try {
    const { jenis_layanan, nip } = req?.query;
    const { customId: userId } = req?.user;

    const { fetcher } = req;

    const currentUser = await User.query().findById(userId);

    if (currentUser?.group !== "MASTER") {
      res.status(403).json({
        message: "Forbidden",
      });
    } else {
      if (listLayananSIASN.includes(jenis_layanan)) {
        const url = `/siasn-ws/layanan/${jenis_layanan}/${nip}`;
        const result = await fetcher.get(url);
        res.json(result?.data);
      } else {
        res.status(400).json({
          message: "Bad Request",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const layananTrackingSimaster = async (req, res) => {
  try {
  } catch (error) {}
};

// layanan lain
const layananIpASN = async (req, res) => {
  try {
    const { nip } = req?.query;
    const { fetcher } = req;
    const { customId: userId } = req?.user;

    const currentUser = await User.query().findById(userId);

    if (currentUser?.group !== "MASTER") {
      res.status(403).json({
        message: "Forbidden",
      });
    } else {
      const result = await fetcher.get(`/siasn-ws/layanan/ip-asn/${nip}`);
      const hasil = result?.data;
      res.json(hasil);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const layananPencantumanGelar = async (req, res) => {
  try {
    const { siasnRequest: fetcher } = req;
    const { employee_number: nip } = req?.user;
    const data = await cekPencantumanGelar(fetcher, nip);
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const layananPencantumanGelarByNip = async (req, res) => {
  try {
    const { nip } = req?.query;
    const { fetcher } = req;
    const result = await fetcher.get(
      `/siasn-ws/layanan/pencantuman-gelar/${nip}`
    );

    const hasil = result?.data;

    if (!hasil) {
      res.json([]);
    } else {
      res.json(hasil);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const layananPencantumanGelarSK = async (req, res) => {
  try {
    try {
      const { id } = req?.query;
      const { fetcher } = req;
      const result = await fetcher.get(
        `/siasn-ws/layanan/pencantuman-gelar/0000/sk/${id}`
      );

      const hasil = result?.data;
      res.json(hasil);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  layananPencantumanGelar,
  layananPencantumanGelarByNip,
  layananPencantumanGelarSK,
  layananTrackingSiasn,
  layananTrackingSimaster,
  layananIpASN,
};

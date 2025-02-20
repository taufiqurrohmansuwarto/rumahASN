const { listPemberhentianSIASN } = require("@/utils/siasn-utils");
const SiasnPemberhentian = require("@/models/siasn/siasn-pemberhentian.model");

const dayjs = require("dayjs");
dayjs.locale("id");
require("dayjs/locale/id");

const serializeData = (data) => {
  return data?.map((item) => ({
    ...item,
    tmtPensiun: dayjs(item?.tmtPensiun).format("DD-MM-YYYY"),
  }));
};

const daftarPemberhentianSIASN = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const month = req?.query?.month || dayjs().format("MM-YYYY");

    const tglAwal = dayjs(month, "MM-YYYY")
      .startOf("month")
      .format("DD-MM-YYYY");

    const tglAkhir = dayjs(month, "MM-YYYY")
      .endOf("month")
      .format("DD-MM-YYYY");

    const result = await listPemberhentianSIASN(request, tglAwal, tglAkhir);
    const hasil = result?.data;

    const hasData = hasil?.code === 1 && hasil?.count !== 0;

    if (!hasData) {
      res.json([]);
    } else {
      const result = serializeData(hasil?.data);
      console.log(result);
      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Internal Server Error",
    });
  }
};

const syncPemberhentianSIASN = async (req, res) => {
  try {
    const { siasnRequest: request } = req;
    const month = req?.query?.month || dayjs().format("MM-YYYY");

    const tglAwal = dayjs(month, "MM-YYYY")
      .startOf("month")
      .format("DD-MM-YYYY");

    const tglAkhir = dayjs(month, "MM-YYYY")
      .endOf("month")
      .format("DD-MM-YYYY");

    const result = await listPemberhentianSIASN(request, tglAwal, tglAkhir);
    const hasil = result?.data;

    const hasData = hasil?.code === 1 && hasil?.count !== 0;

    if (!hasData) {
      res.json([]);
    } else {
      const knex = SiasnPemberhentian.knex();
      await knex
        .delete()
        .from("siasn_pemberhentian")
        .where("tmtPensiun", tglAwal);
      await knex.batchInsert("siasn_pemberhentian", hasil?.data);
      res.json({
        success: true,
        message: "Data berhasil disinkronisasi",
      });
      // const result = serializeData(hasil?.data);
      // console.log(result);
      // res.json(result);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  daftarPemberhentianSIASN,
  syncPemberhentianSIASN,
};

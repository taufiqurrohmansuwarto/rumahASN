const Sinkronisasi = require("@/models/sinkronisasi.model");
const UnorMaster = require("@/models/sync-unor-master.model");
const { round } = require("lodash");
const SyncPegawai = require("@/models/sync-pegawai.model");

const SimasterJfu = require("@/models/simaster-jfu.model");
const SimasterJft = require("@/models/simaster-jft.model");
const { setSinkronisasi } = require("@/utils/helper/controller-helper");
const Papa = require("papaparse");

const ExcelJS = require("exceljs");

const syncSimasterJfu = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const result = await fetcher.get("/refs/jfu-all");

    await setSinkronisasi({
      aplikasi: "simaster",
      layanan: "ref_jfu",
    });

    const knex = SimasterJfu.knex();
    await knex.delete().from("simaster_jfu");
    await knex.batchInsert("simaster_jfu", result?.data);

    res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const syncSimasterJft = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const result = await fetcher.get("/refs/jft-all");

    await setSinkronisasi({
      aplikasi: "simaster",
      layanan: "ref_jft",
    });

    const knex = await SimasterJft.knex();
    await knex.delete().from("simaster_jft");
    await knex.batchInsert("simaster_jft", result?.data);

    res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const syncUnorSimaster = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const opdId = "1";

    if (!opdId) {
      res.status(400).json({ message: "Organization ID is required" });
    } else {
      const result = await fetcher.get(
        `/master-ws/pemprov/opd/${opdId}/departments`
      );

      await setSinkronisasi({
        aplikasi: "simaster",
        layanan: "unor",
      });

      const knex = UnorMaster.knex();

      await knex.delete().from("sync_unor_master");
      await knex.batchInsert("sync_unor_master", result?.data);

      res.json({ message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const convertStringToDecimal = (value) => {
  const number = parseFloat(value);
  return round(number, 2);
};

const syncIpASN = async (req, res) => {
  try {
    const employees = await SyncPegawai.query()
      .select(
        "sync_pegawai.id",
        "sync_pegawai.skpd_id",
        "sync_pegawai.nama_master",
        "sync_pegawai.nip_master",
        "sync_ip_asn.kompetensi",
        "sync_ip_asn.subtotal",
        "sync_ip_asn.kualifikasi",
        "sync_ip_asn.kinerja",
        "sync_ip_asn.disiplin"
      )
      .leftJoin("sync_ip_asn", "sync_pegawai.nip_master", "sync_ip_asn.nip");

    res.json(employees);
  } catch (error) {
    console.error("Error in syncIpASN:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const pegawaiMaster = async (req, res) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 10;

    if (limit === -1 || limit === "all" || limit === "-1") {
      const result = await SyncPegawai.query();
      const data = result?.map((item) => {
        const { skp, ...data } = item;
        const skp2024 = skp?.find((skp) => skp?.tahun === 2024);
        const skp2023 = skp?.find((skp) => skp?.tahun === 2023);
        return {
          ...data,
          skp2024: skp2024?.skp_id ? "ada" : "tidak ada",
          skp2023: skp2023?.skp_id ? "ada" : "tidak ada",
        };
      });
      console.log(result?.[0]);
      const csv = Papa.unparse(data);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="pegawai-master.csv"`
      );
      res.send(csv);
      return;
    } else {
      const result = await SyncPegawai.query()
        .page(parseInt(page) - 1, parseInt(limit))
        .orderBy("skpd_id", "asc");

      const data = {
        data: result?.results,
        total: result?.total,
        page: parseInt(page),
        limit: parseInt(limit),
      };
      res.json(data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const syncPegawai = async (req, res) => {
  try {
    const opdId = "1";
    const { clientCredentialsFetcher: fetcher } = req;
    const { data: employees } = await fetcher.get(
      `/master-ws/pemprov/opd/${opdId}/employees`
    );
    await setSinkronisasi({
      aplikasi: "simaster",
      layanan: "pegawai",
    });

    const knex = SyncPegawai.knex();
    await knex.delete().from("sync_pegawai");
    await knex.batchInsert("sync_pegawai", employees);
    res.json({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const RefSinkronisasi = async (req, res) => {
  try {
    const result = await Sinkronisasi.query().select("*");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  syncIpASN,
  syncUnorSimaster,
  syncPegawai,
  RefSinkronisasi,
  pegawaiMaster,
  syncSimasterJfu,
  syncSimasterJft,
};

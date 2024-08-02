const Sinkronisasi = require("@/models/sinkronisasi.model");
const UnorMaster = require("@/models/sync-unor-master.model");
const { round } = require("lodash");
const siasnIPASN = require("@/models/siasn-ipasn.model");
const SyncPegawai = require("@/models/sync-pegawai.model");

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

      await Sinkronisasi.query()
        .insert({
          aplikasi: "simaster",
          layanan: "unor",
          updated_at: new Date(),
        })
        .onConflict(["aplikasi", "layanan"])
        .merge(["updated_at"]);

      const knex = await UnorMaster.knex();

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

    const result = await SyncPegawai.query().page(
      parseInt(page) - 1,
      parseInt(limit)
    );

    const data = {
      data: result?.results,
      total: result?.total,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    res.json(data);
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
    await Sinkronisasi.query()
      .insert({
        aplikasi: "simaster",
        layanan: "pegawai",
        updated_at: new Date(),
      })
      .onConflict(["aplikasi", "layanan"])
      .merge(["updated_at"]);

    const knex = await SyncPegawai.knex();
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
};

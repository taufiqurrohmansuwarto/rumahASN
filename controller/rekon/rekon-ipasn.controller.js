const SiasnIPASN = require("@/models/siasn-ipasn.model");
const {
  handleError,
  getFilePath,
  parseCSV,
  checkOpdEntrian,
} = require("@/utils/helper/controller-helper");

const SyncPegawai = require("@/models/sync-pegawai.model");

async function getAverageTotalBySkpdId(skpd_id) {
  try {
    const knex = SiasnIPASN.knex();
    const result = await knex("sync_pegawai")
      .leftJoin("siasn_ipasn", "sync_pegawai.nip_master", "siasn_ipasn.nip")
      .select(
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN sync_pegawai.status_master = 'PNS' THEN siasn_ipasn.total END), 2), 0) AS rerata_total_pns`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN sync_pegawai.status_master = 'PPPK' THEN siasn_ipasn.total END), 2), 0) AS rerata_total_pppk`
        )
      )
      .where("sync_pegawai.skpd_id", "ilike", `${skpd_id}%`);

    const data = result[0];
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching average total by skpd_id:", error);
  }
}

async function getAverageTotalForUnorMaster(opdId = "1") {
  try {
    const knex = SiasnIPASN.knex();
    const result = await knex("sync_unor_master as u")
      .leftJoin("sync_pegawai as p", function () {
        this.on("p.skpd_id", "ilike", knex.raw("u.id || '%'"));
      })
      .leftJoin("siasn_ipasn as i", "p.nip_master", "i.nip")
      .select(
        "u.id",
        "u.pId",
        "u.name",
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN p.status_master = 'PNS' THEN i.total END), 2), 0) AS rerata_total_pns`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN p.status_master = 'PPPK' THEN i.total END), 2), 0) AS rerata_total_pppk`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN p.status_master = 'PNS' THEN i.kualifikasi END), 2), 0) AS rerata_kualifikasi_pns`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN p.status_master = 'PPPK' THEN i.kualifikasi END), 2), 0) AS rerata_kualifikasi_pppk`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN p.status_master = 'PNS' THEN i.kompetensi END), 2), 0) AS rerata_kompetensi_pns`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN p.status_master = 'PPPK' THEN i.kompetensi END), 2), 0) AS rerata_kompetensi_pppk`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN p.status_master = 'PNS' THEN i.kinerja END), 2), 0) AS rerata_kinerja_pns`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN p.status_master = 'PPPK' THEN i.kinerja END), 2), 0) AS rerata_kinerja_pppk`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN p.status_master = 'PNS' THEN i.disiplin END), 2), 0) AS rerata_disiplin_pns`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN p.status_master = 'PPPK' THEN i.disiplin END), 2), 0) AS rerata_disiplin_pppk`
        )
      )
      .where("u.pId", "=", opdId) // Filter hanya untuk pId = opdId
      .groupBy("u.id", "u.pId", "u.name")
      .orderBy("u.id");

    return result;
  } catch (error) {
    console.error("Error fetching average total for Unor Master:", error);
  }
}

// [fasilitator, admin]
export const dashboardSiasnIPASN = async (req, res) => {
  try {
    const opdId = req?.query?.opdId || "1";
    const data = await getAverageTotalForUnorMaster(opdId);
    res.json({ data });
  } catch (error) {
    handleError(res, error);
  }
};

// [admin, fasilitator]
export const getRekonIPASN = async (req, res) => {
  try {
    const { organization_id, current_role } = req?.user;
    let opdId;

    if (current_role === "admin") {
      opdId = "1";
    } else {
      opdId = organization_id;
    }
    const { skpd_id = opdId } = req?.query;

    const checkOpd = checkOpdEntrian(opdId, skpd_id);

    if (!checkOpd) {
      res.status(403).json({
        message: "Anda tidak memiliki akses ke OPD ini",
      });
    } else {
      const result = await SyncPegawai.query()
        .select(
          "sync_pegawai.nip_master",
          "sync_pegawai.nama_master",
          "sync_pegawai.opd_master",
          "sync_pegawai.status_master",
          "siasn_ipasn.kualifikasi",
          "siasn_ipasn.kompetensi",
          "siasn_ipasn.kinerja",
          "siasn_ipasn.disiplin",
          "siasn_ipasn.total",
          "siasn_ipasn.updated"
        )
        .leftJoin("siasn_ipasn", "sync_pegawai.nip_master", "siasn_ipasn.nip")
        .where("sync_pegawai.skpd_id", "ilike", `${skpd_id}%`)
        .orderBy("sync_pegawai.nama_master", "asc"); // Urutkan berdasarkan nam

      const averageTotal = await getAverageTotalBySkpdId(skpd_id);
      res.json({ data: result, averageTotal });
    }
  } catch (error) {
    handleError(res, error);
  }
};

// [admin]
export const syncRekonIPASN = async (req, res) => {
  try {
    const data = parseCSV(getFilePath("docs-internal/ipasn.csv"), {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      dynamicTyping: false, // Ensure all values are parsed as text
    });

    // Convert numeric string values to numbers for database compatibility
    const processedData = data.map((item) => {
      const newItem = { ...item };
      // Convert comma-separated decimals to proper format (e.g., 36,5 to 36.5)
      if (newItem.kualifikasi)
        newItem.kualifikasi = newItem.kualifikasi.replace(",", ".");
      if (newItem.kompetensi)
        newItem.kompetensi = newItem.kompetensi.replace(",", ".");
      if (newItem.kinerja) newItem.kinerja = newItem.kinerja.replace(",", ".");
      if (newItem.disiplin)
        newItem.disiplin = newItem.disiplin.replace(",", ".");
      if (newItem.total) newItem.total = newItem.total.replace(",", ".");
      return newItem;
    });

    const knex = SiasnIPASN.knex();
    await knex.delete().from("siasn_ipasn");
    await knex.batchInsert("siasn_ipasn", processedData);

    res.json({ success: true, message: "Data berhasil disinkronisasi" });
  } catch (error) {
    handleError(res, error);
  }
};

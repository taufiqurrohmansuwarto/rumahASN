const SiasnIPASN = require("@/models/siasn-ipasn.model");
const {
  handleError,
  getFilePath,
  parseCSV,
  checkOpdEntrian,
  insertSyncHistories,
} = require("@/utils/helper/controller-helper");

const SyncPegawai = require("@/models/sync-pegawai.model");

async function getIpasnWithPegawai({
  search = "",
  skpd_id = "%",
  min_kualifikasi = 0,
  min_kompetensi = 0,
  min_kinerja = 0,
  min_disiplin = 0,
  min_total = 0,
  page = 1,
  perPage = 10,
  sortBy = "nama_master", // Default sorting berdasarkan nama_master
  sortOrder = "ascend", // Default Ant Design order
} = {}) {
  try {
    const knex = SiasnIPASN.knex();

    // Konversi sortOrder dari "ascend"/"descend" ke "asc"/"desc"
    const validSortOrder =
      sortOrder.toLowerCase() === "descend" ? "desc" : "asc";

    // Pastikan sortBy adalah kolom yang valid agar tidak ada SQL Injection
    const validColumns = [
      "nip",
      "foto_master",
      "nama_master",
      "nip_master",
      "opd_master",
      "kualifikasi",
      "kompetensi",
      "kinerja",
      "disiplin",
      "total",
      "updated",
    ];
    const sortColumn = validColumns.includes(sortBy) ? sortBy : "nama_master";

    // Query utama dengan filter
    const query = knex("siasn_ipasn as ip")
      .leftJoin("sync_pegawai as peg", "ip.nip", "peg.nip_master")
      .select(
        "ip.nip",
        "peg.foto as foto_master",
        "peg.nama_master",
        "peg.jabatan_master",
        "peg.status_master",
        "peg.nip_master",
        "peg.opd_master",
        "ip.kualifikasi",
        "ip.kompetensi",
        "ip.kinerja",
        "ip.disiplin",
        "ip.total",
        "ip.updated"
      )
      .where("peg.skpd_id", "ilike", `${skpd_id}%`);

    // Filter pencarian nama atau NIP
    if (search) {
      query.andWhere((builder) => {
        builder
          .where("peg.nama_master", "ilike", `%${search}%`)
          .orWhere("peg.nip_master", "ilike", `%${search}%`);
      });
    }

    // Filter berdasarkan nilai minimal kualifikasi, kompetensi, kinerja, disiplin, total
    if (min_kualifikasi > 0)
      query.andWhere("ip.kualifikasi", ">=", min_kualifikasi);
    if (min_kompetensi > 0)
      query.andWhere("ip.kompetensi", ">=", min_kompetensi);
    if (min_kinerja > 0) query.andWhere("ip.kinerja", ">=", min_kinerja);
    if (min_disiplin > 0) query.andWhere("ip.disiplin", ">=", min_disiplin);
    if (min_total > 0) query.andWhere("ip.total", ">=", min_total);

    // Sorting lebih stabil dengan tambahan "nip_master" agar tidak berubah tiap halaman
    query.orderBy([
      { column: sortColumn, order: validSortOrder },
      { column: "nip_master", order: "asc" }, // Sorting tambahan untuk kestabilan
    ]);

    // Pagination
    const result = await query.limit(perPage).offset((page - 1) * perPage);

    // Query total data tanpa pagination
    const totalDataQuery = knex("siasn_ipasn as ip")
      .leftJoin("sync_pegawai as peg", "ip.nip", "peg.nip_master")
      .where("peg.skpd_id", "ilike", `${skpd_id}%`);

    // Terapkan filter yang sama ke totalDataQuery
    if (search) {
      totalDataQuery.andWhere((builder) => {
        builder
          .where("peg.nama_master", "ilike", `%${search}%`)
          .orWhere("peg.nip_master", "ilike", `%${search}%`);
      });
    }
    if (min_kualifikasi > 0)
      totalDataQuery.andWhere("ip.kualifikasi", ">=", min_kualifikasi);
    if (min_kompetensi > 0)
      totalDataQuery.andWhere("ip.kompetensi", ">=", min_kompetensi);
    if (min_kinerja > 0)
      totalDataQuery.andWhere("ip.kinerja", ">=", min_kinerja);
    if (min_disiplin > 0)
      totalDataQuery.andWhere("ip.disiplin", ">=", min_disiplin);
    if (min_total > 0) totalDataQuery.andWhere("ip.total", ">=", min_total);

    // Pastikan query total count dieksekusi
    const totalCount = await totalDataQuery.count("* as total").first();

    return {
      data: result,
      filters: {
        search,
        skpd_id,
        min_kualifikasi,
        min_kompetensi,
        min_kinerja,
        min_disiplin,
        min_total,
      },
      sorting: {
        sortBy,
        sortOrder: validSortOrder,
      },
      page,
      perPage,
      totalData: totalCount?.total || 0,
      totalPages: Math.ceil((totalCount?.total || 0) / perPage),
    };
  } catch (error) {
    console.error("Error fetching IPASN data:", error);
  }
}

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
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN sync_pegawai.status_master = 'PNS' THEN siasn_ipasn.kualifikasi END), 2), 0) AS rerata_kualifikasi_pns`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN sync_pegawai.status_master = 'PPPK' THEN siasn_ipasn.kualifikasi END), 2), 0) AS rerata_kualifikasi_pppk`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN sync_pegawai.status_master = 'PNS' THEN siasn_ipasn.kompetensi END), 2), 0) AS rerata_kompetensi_pns`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN sync_pegawai.status_master = 'PPPK' THEN siasn_ipasn.kompetensi END), 2), 0) AS rerata_kompetensi_pppk`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN sync_pegawai.status_master = 'PNS' THEN siasn_ipasn.kinerja END), 2), 0) AS rerata_kinerja_pns`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN sync_pegawai.status_master = 'PPPK' THEN siasn_ipasn.kinerja END), 2), 0) AS rerata_kinerja_pppk`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN sync_pegawai.status_master = 'PNS' THEN siasn_ipasn.disiplin END), 2), 0) AS rerata_disiplin_pns`
        ),
        knex.raw(
          `COALESCE(ROUND(AVG(CASE WHEN sync_pegawai.status_master = 'PPPK' THEN siasn_ipasn.disiplin END), 2), 0) AS rerata_disiplin_pppk`
        )
      )
      .where("sync_pegawai.skpd_id", "ilike", `${skpd_id}%`);

    const data = result[0];
    return data;
  } catch (error) {
    console.error("Error fetching average total by skpd_id:", error);
  }
}

async function getAverageByUnor(opdId) {
  try {
    const knex = SiasnIPASN.knex();
    const result = await knex("sync_unor_master as u")
      .leftJoin("sync_pegawai as p", function () {
        this.on("p.skpd_id", "ilike", knex.raw("u.id || '%'"));
      })
      .leftJoin("siasn_ipasn as i", "p.nip_master", "i.nip")
      .select(
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
      .where("u.id", "=", opdId) // Filter hanya untuk pId = opdId
      .groupBy("u.id", "u.pId", "u.name")
      .orderBy("u.id");

    const data = result[0];
    return data;
  } catch (error) {
    console.error("Error fetching average by unor:", error);
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
    const { organization_id, current_role } = req?.user;
    let skpdId;

    if (current_role === "admin") {
      skpdId = "1";
    } else {
      skpdId = organization_id;
    }

    const opdId = "1";
    const type = req?.query?.type || "unor";
    const orgId = req?.query?.skpd_id || skpdId;

    const checkOpd = checkOpdEntrian(skpdId, orgId);

    if (!checkOpd) {
      res.status(403).json({
        message: "Anda tidak memiliki akses ke OPD ini",
      });
    } else {
      if (type === "unor") {
        const data = await getAverageTotalForUnorMaster(opdId);
        res.json({ data });
      } else {
        const data = await getAverageByUnor(orgId);
        res.json({ data });
      }
    }
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

export const getEmployeeIPASN = async (req, res) => {
  try {
    const { organization_id, current_role } = req?.user;
    let opdId;

    if (current_role === "admin") {
      opdId = "1";
    } else {
      opdId = organization_id;
    }
    const {
      skpd_id = opdId,
      page = 1,
      perPage = 10,
      search = "",
      min_kualifikasi = 0,
      min_kompetensi = 0,
      min_kinerja = 0,
      min_disiplin = 0,
      min_total = 0,
      sort = "nama_master",
      order = "asc",
    } = req?.query;

    const checkOpd = checkOpdEntrian(opdId, skpd_id);

    if (!checkOpd) {
      res.status(403).json({
        message: "Anda tidak memiliki akses ke OPD ini",
      });
    } else {
      const data = await getIpasnWithPegawai({
        skpd_id,
        page,
        perPage,
        search,
        min_kualifikasi,
        min_kompetensi,
        min_kinerja,
        min_disiplin,
        min_total,
        sortBy: sort,
        sortOrder: order,
      });
      res.json(data);
    }
  } catch (error) {
    handleError(res, error);
  }
};

const fs = require("fs");
const path = require("path");
const paparse = require("papaparse");
const Sinkronisasi = require("@/models/sinkronisasi.model");

// melihat total pegawai berdasarkan perangkat daerah di table rekon (sync_pegawai) bukan realtime
module.exports.checkTotalPegawai = async (knex, opdId) => {
  const result = await knex("sync_pegawai")
    .where("skpd_id", "ilike", `${opdId}%`)
    .count("* as total")
    .first();

  return result?.total || 0;
};

module.exports.handleError = (res, error) => {
  console.log("ini error", error);
  const errorCode = error?.response?.data?.code || error?.code || 500;

  const message =
    error?.response?.data?.message || error?.message || "Internal server error";
  res.status(errorCode).json({
    message,
  });
};

module.exports.getFilePath = (filepath) => path.join(process.cwd(), filepath);

module.exports.parseCSV = (filePath, options) => {
  const file = fs.readFileSync(filePath, "utf8");
  return paparse.parse(file, {
    header: true,
    skipEmptyLines: true,
    ...options,
  }).data;
};

module.exports.checkOpdEntrian = (opdId, entrian) => {
  return entrian?.includes(opdId);
};

const checkOpdEntri = (opdId, entrian) => {
  return entrian?.includes(opdId);
};

module.exports.insertSyncHistories = async (aplikasi, layanan) => {
  return await Sinkronisasi.query()
    .insert({
      aplikasi,
      layanan,
    })
    .onConflict("aplikasi, layanan")
    .merge();
};

module.exports.getOpdId = (user) => {
  const { organization_id, current_role } = user;
  return current_role === "admin" ? "1" : organization_id;
};

module.exports.validateOpd = (res, opdId, skpd_id) => {
  const checkOpd = checkOpdEntri(opdId, skpd_id);
  if (!checkOpd) {
    res.status(400).json({ message: "OPD tidak ditemukan" });
    return false;
  }
  return true;
};

module.exports.setSinkronisasi = async (data = {}) => {
  // Destructuring dengan nilai default null untuk setiap field
  const {
    aplikasi = null,
    layanan = null,
    periode = null,
    query = null,
  } = data;

  // Upsert manual ke tabel Sinkronisasi berdasarkan aplikasi, layanan, dan periode (atau aplikasi, layanan saja jika periode null)
  let sinkronisasi;

  if (periode) {
    sinkronisasi = await Sinkronisasi.query()
      .where({
        aplikasi,
        layanan,
        periode,
      })
      .first();
  } else {
    sinkronisasi = await Sinkronisasi.query()
      .where({
        aplikasi,
        layanan,
      })
      .whereNull("periode")
      .first();
  }

  if (sinkronisasi) {
    // Jika sudah ada, update data
    sinkronisasi = await Sinkronisasi.query().patchAndFetchById(
      sinkronisasi.id,
      {
        query,
        periode,
        updated_at: new Date(),
      }
    );
  } else {
    // Jika belum ada, insert data baru
    sinkronisasi = await Sinkronisasi.query().insert({
      aplikasi,
      layanan,
      periode,
      query,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  return sinkronisasi;
};

module.exports.getSinkronisasi = async (data = {}) => {
  const {
    aplikasi = null,
    layanan = null,
    periode = null,
    query = null,
  } = data;

  // Ambil data sinkronisasi berdasarkan parameter yang diberikan
  let sinkronisasiQuery = Sinkronisasi.query().where({
    aplikasi,
    layanan,
  });

  if (periode !== null) {
    sinkronisasiQuery = sinkronisasiQuery.where("periode", periode);
  } else {
    sinkronisasiQuery = sinkronisasiQuery.whereNull("periode");
  }

  if (query !== null) {
    sinkronisasiQuery = sinkronisasiQuery.where("query", query);
  }

  // Ambil hanya kolom updated_at
  const sinkronisasi = await sinkronisasiQuery.select("updated_at").first();

  // Jika ada, kembalikan updated_at, jika tidak, kembalikan null
  return sinkronisasi ? sinkronisasi.updated_at : null;
};

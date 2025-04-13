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
  console.log(error);
  const message = error?.response?.data?.message || "Internal server error";
  res.status(500).json({
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

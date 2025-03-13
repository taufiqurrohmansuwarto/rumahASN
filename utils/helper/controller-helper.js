const fs = require("fs");
const path = require("path");
const paparse = require("papaparse");
const Sinkronisasi = require("@/models/sinkronisasi.model");

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

module.exports.insertSyncHistories = async (aplikasi, layanan) => {
  return await Sinkronisasi.query()
    .insert({
      aplikasi,
      layanan,
    })
    .onConflict("aplikasi, layanan")
    .merge();
};

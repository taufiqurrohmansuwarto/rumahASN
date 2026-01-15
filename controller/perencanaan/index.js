const formasiController = require("./formasi.controller");
const usulanController = require("./usulan.controller");
const formasiUsulanController = require("./formasi_usulan.controller");
const lampiranController = require("./lampiran.controller");
const riwayatAuditController = require("./riwayat_audit.controller");
const referensiController = require("./referensi.controller");

module.exports = {
  formasi: formasiController,
  usulan: usulanController,
  formasiUsulan: formasiUsulanController,
  lampiran: lampiranController,
  riwayatAudit: riwayatAuditController,
  referensi: referensiController,
};
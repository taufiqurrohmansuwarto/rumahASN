const formasiController = require("./formasi.controller");
const usulanController = require("./usulan.controller");
const lampiranController = require("./lampiran.controller");
const riwayatAuditController = require("./riwayat_audit.controller");

module.exports = {
  formasi: formasiController,
  usulan: usulanController,
  lampiran: lampiranController,
  riwayatAudit: riwayatAuditController,
};


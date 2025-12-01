const User = require("@/models/users.model");
const SyncPegawai = require("@/models/sync-pegawai.model");
const { raw } = require("objection");
const { handleError } = require("@/utils/helper/controller-helper");

module.exports.getProfile = async (req, res) => {
  try {
    const { employee_number: nip } = req.user;
    const profile = await SyncPegawai.query()
      .where("nip_master", nip)
      .select(
        "foto as image",
        "nip_master as nip",
        "nama_master as nama",
        "opd_master as perangkat_daerah",
        "jabatan_master as jabatan",
        "status_master as status_kepegawaian",
        "no_hp_master as no_hp",
        "email_master as email"
      )
      .first();
    res.json(profile);
  } catch (error) {
    handleError(res, error);
  }
};

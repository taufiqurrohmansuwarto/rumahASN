const SyncPegawai = require("@/models/sync-pegawai.model");

module.exports.cariAtasanLangsung = async (currentOpdId) => {
  try {
    const currentUserDepartmentCode = currentOpdId.substring(0, 3);
    const dataAtasan = await SyncPegawai.query()
      .where("skpd_id", currentUserDepartmentCode)
      .first();

    if (!dataAtasan) {
      throw new Error("Data atasan not found");
    } else {
      return dataAtasan;
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports.cariSeluruhRekanKerja = async (currentOpdId) => {
  try {
    // 12301 menjadi 123
    const currentUserDepartmentCode = currentOpdId.substring(0, 3);
    const employees = await SyncPegawai.query().where(
      "skpd_id",
      "ilike",
      `${currentUserDepartmentCode}%`
    );

    if (!employees) {
      throw new Error("Employee not found");
    } else {
      return employees;
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports.cariRekanKerjaDiBidang = async (currentOpdId) => {
  try {
    // 1230101 menjadi 12301 ambil 2 string dibelakang jangan langsung ke 5
    const currentUserDepartmentCode = currentOpdId?.toString().slice(0, -2);
    const employees = await SyncPegawai.query().where(
      "skpd_id",
      "ilike",
      `${currentUserDepartmentCode}%`
    );

    if (!employees) {
      throw new Error("Employee not found");
    } else {
      return employees;
    }
  } catch (error) {
    console.log(error);
  }
};

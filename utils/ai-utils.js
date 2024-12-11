const SyncPegawai = require("@/models/sync-pegawai.model");
const { raw } = require("objection");

function getParentCodes(code) {
  let codes = [];
  let currentCode = code.toString();

  while (currentCode.length > 3) {
    // Minimal 3 digit
    currentCode = currentCode.slice(0, -2); // Potong 2 digit dari belakang
    codes.push(currentCode);
  }

  return codes;
}

module.exports.getPengguna = async (employeeNumber) => {
  try {
    const result = await SyncPegawai.query()
      .where("nip_master", employeeNumber)
      .select(
        "id as id",
        raw(
          "nama_master || ' ' || gelar_depan_master || ' ' || gelar_belakang_master as nama"
        ),
        "nip_master as nip",
        raw(
          "pangkat_master || '/' || '(' || golongan_master || ')' as golongan"
        ),
        "jabatan_master as jabatan",
        "opd_master as unor"
      )
      .first();
    return result;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports.cariPejabat = async (currentOpdId) => {
  // misal kode 1230101 looping menjadi 12301 dan 123
  const parentCodes = getParentCodes(currentOpdId);
  try {
    const pejabat = await SyncPegawai.query()
      .whereIn("skpd_id", parentCodes)
      .select(
        "id as id",
        raw(
          "nama_master || ' ' || gelar_depan_master || ' ' || gelar_belakang_master as nama"
        ),
        "nip_master as nip",
        raw(
          "pangkat_master || '/' || '(' || golongan_master || ')' as golongan"
        ),
        "jabatan_master as jabatan",
        "opd_master as unor"
      )
      .andWhere("jabatan_asn", "=", "JABATAN ADMINISTRATOR");

    if (!pejabat) {
      throw new Error("Pejabat not found");
    } else {
      return pejabat;
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports.cariAtasanLangsung = async (currentOpdId) => {
  try {
    const currentUserDepartmentCode = currentOpdId.substring(0, 3);
    const dataAtasan = await SyncPegawai.query()
      .where("skpd_id", currentUserDepartmentCode)
      .select(
        "id as id",
        raw(
          "gelar_depan_master || ' ' || nama_master || ' ' || gelar_belakang_master as nama"
        ),
        "nip_master as nip",
        "status_master as status",
        raw(
          "pangkat_master || '/' || '(' || golongan_master || ')' as golongan"
        ),
        "jabatan_master as jabatan"
      )
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
    const employees = await SyncPegawai.query()
      .where("skpd_id", "ilike", `${currentUserDepartmentCode}%`)
      .select(
        "id as id",
        raw(
          "gelar_depan_master || ' ' || nama_master || ' ' || gelar_belakang_master as nama"
        ),
        "nip_master as nip",
        "status_master as status",
        raw(
          "pangkat_master || '/' || '(' || golongan_master || ')' as golongan"
        ),
        "jabatan_master as jabatan"
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

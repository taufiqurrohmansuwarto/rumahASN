const SyncPegawai = require("@/models/sync-pegawai.model");
const { raw } = require("objection");
const HeaderModel = require("@/models/letter_managements/headers.model");

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

async function searchPegawaiById(id) {
  const pegawai = await SyncPegawai.query()
    .where("id", id)
    .first()
    .select(
      "nip_master as nip",
      raw(
        "trim(concat(gelar_depan_master, ' ', nama_master, ' ', gelar_belakang_master)) as nama"
      ),
      raw(
        "trim(concat(pangkat_master, '/', '(', golongan_master, ')')) as golongan"
      ),
      "opd_master as unor"
    )
    .withGraphFetched("siasn");

  const hasil = {
    nip: pegawai?.nip,
    nama: pegawai?.nama,
    golongan: pegawai?.golongan,
    unor: pegawai?.unor,
    jabatan: pegawai?.siasn?.jabatan_nama,
  };

  return hasil;
}

module.exports.getPegawaiById = async (id) => {
  try {
    const pegawai = await searchPegawaiById(id);
    if (!pegawai) {
      throw new Error("Pegawai not found");
    } else {
      return pegawai;
    }
  } catch (error) {
    console.log(error);
    throw new Error("Pegawai not found");
  }
};

module.exports.getPegawaiByIds = async (ids) => {
  try {
    let promises = [];
    for (const id of ids) {
      promises.push(searchPegawaiById(id));
    }
    const results = await Promise.allSettled(promises);
    const hasil = results.filter((result) => result.status === "fulfilled");
    const data = hasil.map((item) => item.value);
    return data;
  } catch (error) {
    console.log(error);
    throw new Error("Pegawai not found");
  }
};

async function getPegawai(nama, currentOpdId) {
  try {
    const organizationId = currentOpdId?.substring(0, 3);
    const knex = SyncPegawai.knex();
    const result = await knex.raw(
      `select * from cari_pegawai_dinamis('${organizationId}', '${nama}')`
    );

    const hasil = result?.rows[0];

    if (!hasil) {
      return;
    } else {
      const currentPegawai = await SyncPegawai.query()
        .where("nip_master", hasil?.nip_master)
        .select(
          "id as id",
          raw(
            "trim(concat(gelar_depan_master, ' ', nama_master, ' ', gelar_belakang_master)) as nama"
          )
        )
        .first();

      const result = {
        id: currentPegawai?.id,
        nama: currentPegawai?.nama,
      };

      return result;
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

module.exports.getTemanKerja = async (names, currentOpdId) => {
  let promises = [];
  for (const name of names) {
    promises.push(getPegawai(name, currentOpdId));
  }
  const results = await Promise.allSettled(promises);
  const hasil = results.filter((result) => result.status === "fulfilled");
  // if empty object return
  const data = hasil.map((item) => item.value);
  return data;
};

// cari header dengan kurangi 2 digit dari belakang
async function cariHeader(currentOpdId) {
  const codes = getParentCodes(currentOpdId);
  codes.unshift(currentOpdId); // Add current code at start

  for (const code of codes) {
    const result = await HeaderModel.query().where("skpd_id", code).first();
    if (result) {
      return result;
    }
  }

  return null;
}

module.exports.getHeaderSuratUnitKerja = async (currentOpdId) => {
  try {
    const result = await cariHeader(currentOpdId);
    if (!result) {
      throw new Error("Header surat tidak ditemukan");
    } else {
      return result;
    }
  } catch (error) {
    console.log(error);
    throw new Error("Header surat tidak dapat ditemukan");
  }
};

module.exports.cariPejabatNew = async (currentOpdId, nama) => {
  try {
    const organizationId = currentOpdId?.substring(0, 3);
    const knex = HeaderModel.knex();
    const result = await knex.raw(
      `select * from cari_pejabat_dinamis('${organizationId}', '${nama}')`
    );

    const hasil = result?.rows[0];

    if (!hasil) {
      throw new Error("Pejabat tidak ditemukan");
    } else {
      const { nip_master } = hasil;
      const pejabat = await SyncPegawai.query()
        .where("nip_master", nip_master)
        .select(
          "id as id",
          raw(
            "nama_master || ' ' || gelar_depan_master || ' ' || gelar_belakang_master as nama"
          )
        )
        .withGraphFetched("siasn")
        .first();

      const result = {
        atasan_id: pejabat?.id,
        nama: pejabat?.nama,
        jabatan: pejabat?.siasn?.jabatan_nama,
      };

      return result;
    }
  } catch (error) {
    console.log(error);
    throw new Error("Pejabat tidak ditemukan");
  }
};

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

const cariOrang = async (nama, currentOpdId) => {
  ``;
};

// cari rekan kerja
module.exports.cariRekanKerja = async (nama, currentOpdId) => {
  const currentDepartmentCode =
    currentOpdId?.length > 3 ? currentOpdId?.substring(0, 3) : currentOpdId;
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

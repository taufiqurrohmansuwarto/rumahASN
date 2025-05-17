import {
  getOpdId,
  validateOpd,
  handleError,
} from "@/utils/helper/controller-helper";
const SyncPegawai = require("@/models/sync-pegawai.model");

const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;
const DEFAULT_SOURCE = "simaster";

/**
 * Standard API response formatter
 */
const formatApiResponse = (page, limit, total, data) => ({
  page,
  limit,
  total: total.total,
  data,
});

/**
 * Bangun query data dengan subquery (simaster) atau join langsung (siasn)
 */
const createBaseQuery = (skpdId, conditionBuilder, source = DEFAULT_SOURCE) => {
  const knex = SyncPegawai.knex();
  if (source === DEFAULT_SOURCE) {
    const main = knex("sync_pegawai as sync")
      .select(
        "sync.nip_master as nip",
        "sync.nama_master as nama",
        "sync.foto as foto",
        "sync.opd_master as unit_organisasi",
        "sync.jabatan_master as jabatan",
        // Kolom dari siasn_employees
        "siasn.*"
      )
      .leftJoin("siasn_employees as siasn", "sync.nip_master", "siasn.nip_baru")
      .whereRaw("sync.skpd_id ILIKE ?", [`${skpdId}%`]);

    // subquery: filter berdasar conditionBuilder pada siasn_employees
    const query = main
      .whereIn("sync.nip_master", function () {
        this.select("nip_baru")
          .from("siasn_employees as siasn")
          .where(function () {
            conditionBuilder.call(this);
          });
      })
      .orderBy("sync.nama_master", "asc");

    return query;
  }

  // mode langsung pada siasn_employees
  const query = knex("siasn_employees as siasn")
    .select(
      "siasn.*",
      "siasn.nip_baru as nip",
      "siasn.nama as nama",
      "siasn.jabatan_nama as jabatan",
      "siasn.unor_nama as unit_organisasi"
    )
    .andWhere(function () {
      conditionBuilder.call(this);
    })
    .orderBy("siasn.nama", "asc");

  return query;
};

/**
 * Bangun query hitung total dengan subquery (simaster) atau langsung (siasn)
 */
const createCountingQuery = (
  skpdId,
  conditionBuilder,
  source = DEFAULT_SOURCE
) => {
  const knex = SyncPegawai.knex();
  if (source === DEFAULT_SOURCE) {
    return knex("sync_pegawai as sync")
      .count("* as total")
      .whereRaw("sync.skpd_id ILIKE ?", [`${skpdId}%`])
      .whereIn("sync.nip_master", function () {
        this.select("nip_baru")
          .from("siasn_employees as siasn")
          .where(function () {
            conditionBuilder.call(this);
          });
      })
      .first();
  }

  return knex("siasn_employees as siasn")
    .count("* as total")
    .where(function () {
      conditionBuilder.call(this);
    })
    .first();
};
/**
 * HOF untuk list-based endpoints
 */
const listController = (conditionBuilder) => async (req, res) => {
  try {
    const opdId = getOpdId(req.user);
    const {
      skpd_id = opdId,
      limit = DEFAULT_LIMIT,
      page = DEFAULT_PAGE,
      source = DEFAULT_SOURCE,
    } = req.query;

    if (source === DEFAULT_SOURCE && !validateOpd(res, opdId, skpd_id)) return;

    // build kondisi + search
    const condition = function () {
      conditionBuilder.call(this);
    };

    const pageNum = Number(page);
    const lim = Number(limit);

    const isAdminRole = req?.user?.current_role === "admin";

    let currentSource = source;

    if (!isAdminRole) {
      // admin bisa melihat data dari siasn
      currentSource = DEFAULT_SOURCE;
    }

    // data dan total
    const dataQuery = createBaseQuery(skpd_id, condition, currentSource);
    if (lim !== -1) dataQuery.limit(lim).offset((pageNum - 1) * lim);

    const [data, total] = await Promise.all([
      dataQuery,
      createCountingQuery(skpd_id, condition, currentSource),
    ]);

    // kirim response
    if (currentSource === DEFAULT_SOURCE) {
      return res.json(formatApiResponse(pageNum, lim, total, data));
    } else {
      return res.json({ total: total.total, data });
    }
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Condition builders sesuai kebutuhan accuracy
 */
const tmtCpnsVsPnsCondition = function () {
  this.whereRaw(
    "to_date(siasn.tmt_cpns, 'DD-MM-YYYY') > to_date(siasn.tmt_pns, 'DD-MM-YYYY')"
  )
    .andWhere("siasn.status_cpns_pns", "!=", "C")
    .andWhere("siasn.kedudukan_hukum_id", "!=", "71");
};

const jenisPegawaiDPKCondition = function () {
  this.where("siasn.jenis_pegawai_id", "!=", "10");
};

const masaKerjaStrukturalCondition = function () {
  this.where("siasn.jenis_jabatan_id", "1").andWhere(
    SyncPegawai.knex().raw("CAST(siasn.mk_tahun AS INTEGER)"),
    "<",
    2
  );
};

const caseEselonPendidikan = `
  case
     when siasn.eselon_id = '1' then '40'
     when siasn.eselon_id = '2' then '40'
     when siasn.eselon_id = '3' then '15'
     when siasn.eselon_id = '4' then '15'
     when siasn.eselon_id = '5' then '15'
     else null
  end
`;

const tingkatPendidikanEselonTidakMemenuhiSyaratCondition = function () {
  this.where("siasn.jenis_jabatan_id", "1")
    .andWhere("siasn.eselon_id", "<=", "22")
    .andWhereRaw(`${caseEselonPendidikan} IS NOT NULL`)
    .andWhereRaw(`siasn.tingkat_pendidikan_id < ${caseEselonPendidikan}`);
};

const jabatanPimpinanTinggiDibawahPangkatMinimalCondition = function () {
  this.where("siasn.jenis_jabatan_id", "1")
    .andWhere("siasn.eselon_id", "<=", "22")
    .andWhere("siasn.gol_akhir_id", "<", "42");
};

const nikBelumValidCondition = function () {
  this.where(
    SyncPegawai.knex().raw("cast(siasn.is_valid_nik as boolean)"),
    "=",
    false
  );
};

const pelaksanaJabatanFungsionalCondition = function () {
  this.where("siasn.jenis_jabatan_id", "4")
    .andWhere(function () {
      this.where("siasn.jabatan_nama", "ilike", "%ahli%")
        .orWhere("siasn.jabatan_nama", "ilike", "%terampil%")
        .orWhere("siasn.jabatan_nama", "ilike", "%penyelia%")
        .orWhere("siasn.jabatan_nama", "ilike", "%mahir%");
    })
    .andWhere("siasn.status_cpns_pns", "!=", "C")
    .andWhere("siasn.kedudukan_hukum_id", "!=", "71")
    .andWhere("siasn.kedudukan_hukum_id", "!=", "72");
};

const casePendidikanFungsional = `
  CASE
    WHEN siasn.jabatan_nama ILIKE '%Ahli Utama%'   THEN '35'
    WHEN siasn.jabatan_nama ILIKE '%Ahli Madya%'   THEN '30'
    WHEN siasn.jabatan_nama ILIKE '%Ahli Muda%'    THEN '30'
    WHEN siasn.jabatan_nama ILIKE '%Ahli Pertama%' THEN '30'
    WHEN siasn.jabatan_nama ILIKE '%Penyelia%'     THEN '15'
    WHEN siasn.jabatan_nama ILIKE '%Mahir%'        THEN '15'
    WHEN siasn.jabatan_nama ILIKE '%Terampil%'     THEN '05'
    WHEN siasn.jabatan_nama ILIKE '%Pemula%'       THEN '05'
    ELSE NULL
  END
`;

const pendidikanFungsionalCondition = function () {
  this.where("siasn.jenis_jabatan_id", "2")
    .andWhereNot("siasn.kedudukan_hukum_id", ["71", "72"])
    .andWhereRaw(`${casePendidikanFungsional} IS NOT NULL`)
    .andWhereRaw(`siasn.tingkat_pendidikan_id < ${casePendidikanFungsional}`);
};

// placeholder untuk endpoint yang belum ada logika
const pppkSalahKedhukCondition = function () {
  /* TODO: atur syarat PPPK */
};
const eselonPendidikanCondition = function () {
  /* TODO: atur syarat pendidikan eselon */
};

/**
 * Export semua list-based endpoints
 */
export const tmtCpnsLebihBesarDariTMTPNS = listController(
  tmtCpnsVsPnsCondition
);
export const jenisPegawaiDPKTidakSesuai = listController(
  jenisPegawaiDPKCondition
);

export const masaKerjaKurangDari2TahunStruktural = listController(
  masaKerjaStrukturalCondition
);
export const nikBelumValid = listController(nikBelumValidCondition);
export const pelaksanaNamaJabatanFungsional = listController(
  pelaksanaJabatanFungsionalCondition
);
export const tingkatPendidikanJabatanFungsionalTidakMemenuhiSyarat =
  listController(pendidikanFungsionalCondition);
export const PPPKSalahKedhuk = listController(pppkSalahKedhukCondition);
export const tingkatPendidikanEselonTidakMemenuhiSyarat = listController(
  tingkatPendidikanEselonTidakMemenuhiSyaratCondition
);

export const jabatanPimpinanTinggiDibawahPangkatMinimal = listController(
  jabatanPimpinanTinggiDibawahPangkatMinimalCondition
);

/**
 * Dashboard Accuracy: kumpulkan beberapa indikator sekaligus
 */
export const dashboardAccuracy = async (req, res) => {
  try {
    const opdId = getOpdId(req.user);
    const { skpd_id = opdId } = req.query;
    if (!validateOpd(res, opdId, skpd_id)) return;

    const [
      tmtCpns,
      jenisDpk,
      masaKerja,
      nikInvalid,
      pelaksanaFungsi,
      pendidikanFungsi,
      jabatanPimpinanTinggiDibawahPangkatMinimal,
      tingkatPendidikanEselonTidakMemenuhiSyarat,
    ] = await Promise.all([
      createCountingQuery(skpd_id, tmtCpnsVsPnsCondition),
      createCountingQuery(skpd_id, jenisPegawaiDPKCondition),
      createCountingQuery(skpd_id, masaKerjaStrukturalCondition),
      createCountingQuery(skpd_id, nikBelumValidCondition),
      createCountingQuery(skpd_id, pelaksanaJabatanFungsionalCondition),
      createCountingQuery(skpd_id, pendidikanFungsionalCondition),
      createCountingQuery(
        skpd_id,
        jabatanPimpinanTinggiDibawahPangkatMinimalCondition
      ),
      createCountingQuery(
        skpd_id,
        tingkatPendidikanEselonTidakMemenuhiSyaratCondition
      ),
    ]);

    const [
      tmtCpnsSiasn,
      jenisDpkSiasn,
      masaKerjaSiasn,
      nikInvalidSiasn,
      pelaksanaFungsiSiasn,
      pendidikanFungsiSiasn,
      jabatanPimpinanTinggiDibawahPangkatMinimalSiasn,
      tingkatPendidikanEselonTidakMemenuhiSyaratSiasn,
    ] = await Promise.all([
      createCountingQuery(skpd_id, tmtCpnsVsPnsCondition, "siasn"),
      createCountingQuery(skpd_id, jenisPegawaiDPKCondition, "siasn"),
      createCountingQuery(skpd_id, masaKerjaStrukturalCondition, "siasn"),
      createCountingQuery(skpd_id, nikBelumValidCondition, "siasn"),
      createCountingQuery(
        skpd_id,
        pelaksanaJabatanFungsionalCondition,
        "siasn"
      ),
      createCountingQuery(skpd_id, pendidikanFungsionalCondition, "siasn"),
      createCountingQuery(
        skpd_id,
        jabatanPimpinanTinggiDibawahPangkatMinimalCondition,
        "siasn"
      ),
      createCountingQuery(
        skpd_id,
        tingkatPendidikanEselonTidakMemenuhiSyaratCondition,
        "siasn"
      ),
    ]);

    const hasil = [
      {
        id: "tmt-cpns-lebih-besar-dari-tmt-pns",
        label: "TMT CPNS > TMT PNS",
        value: tmtCpns.total,
        siasn: tmtCpnsSiasn.total,
        bobot: 9.52,
      },
      {
        id: "jenis-pegawai-dpk-tidak-sesuai",
        label: "Jenis Pegawai DPK Tidak Sesuai",
        value: jenisDpk.total,
        siasn: jenisDpkSiasn.total,
        bobot: 21.43,
      },
      {
        id: "masa-kerja-kurang-dari-2-tahun-struktural",
        label: "Masa Kerja < 2 Tahun (Struktural)",
        value: masaKerja.total,
        siasn: masaKerjaSiasn.total,
        bobot: 7.14,
      },
      {
        id: "nik-belum-valid",
        label: "NIK Belum Valid",
        value: nikInvalid.total,
        siasn: nikInvalidSiasn.total,
        bobot: 4.76,
      },
      {
        id: "pelaksana-nama-jabatan-fungsional",
        label: "Pelaksana Nama Jabatan Fungsional",
        value: pelaksanaFungsi.total,
        siasn: pelaksanaFungsiSiasn.total,
        bobot: 4.76,
      },
      {
        id: "tingkat-pendidikan-jabatan-fungsional-tidak-memenuhi-syarat",
        label: "Pendidikan Jabatan Fungsional Tidak Memenuhi",
        value: pendidikanFungsi.total,
        siasn: pendidikanFungsiSiasn.total,
        bobot: 14.29,
      },
      {
        id: "jpt-dibawah-pangkat-minimal",
        label: "Jabatan Pimpinan Tinggi Dibawah Pangkat Minimal",
        value: jabatanPimpinanTinggiDibawahPangkatMinimal.total,
        siasn: jabatanPimpinanTinggiDibawahPangkatMinimalSiasn.total,
        bobot: 14.29,
      },
      {
        id: "tk-pendidikan-eselon-tdk-memenuhi-syarat",
        label: "Tingkat Pendidikan Eselon Tidak Memenuhi Syarat",
        value: tingkatPendidikanEselonTidakMemenuhiSyarat.total,
        siasn: tingkatPendidikanEselonTidakMemenuhiSyaratSiasn.total,
        bobot: 14.29,
      },
    ];

    res.json(hasil);
  } catch (error) {
    handleError(res, error);
  }
};

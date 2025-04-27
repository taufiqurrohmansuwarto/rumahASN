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
 * Tambah filter pencarian nama (simaster vs siasn)
 */
const addSearchFilter = (search, query, source) => {
  if (!search) return;
  if (source === DEFAULT_SOURCE) {
    query.where("sync.nama_master", "ILIKE", `%${search}%`);
  } else {
    query.where("siasn.nama", "ILIKE", `%${search}%`);
  }
};

/**
 * Bangun query data (simaster vs siasn)
 */
const createBaseQuery = (skpdId, conditionBuilder, source = DEFAULT_SOURCE) => {
  const knex = SyncPegawai.knex();
  if (source === DEFAULT_SOURCE) {
    return knex("sync_pegawai as sync")
      .select(
        "sync.nip_master",
        "sync.nama_master",
        "sync.foto",
        "sync.opd_master",
        "siasn.email",
        "siasn.nomor_hp"
      )
      .innerJoin(
        "siasn_employees as siasn",
        "sync.nip_master",
        "siasn.nip_baru"
      )
      .whereRaw("sync.skpd_id ILIKE ?", [`${skpdId}%`])
      .andWhere(conditionBuilder)
      .orderBy("sync.nama_master", "asc");
  }
  return knex("siasn_employees as siasn")
    .select(
      "siasn.nip_baru as nip_master",
      "siasn.nama as nama_master",
      "siasn.foto",
      "siasn.opd_master",
      "siasn.email",
      "siasn.nomor_hp"
    )
    .andWhere(conditionBuilder)
    .orderBy("siasn.nama", "asc");
};

/**
 * Bangun query hitung total (simaster vs siasn)
 */
const createCountingQuery = (
  skpdId,
  conditionBuilder,
  source = DEFAULT_SOURCE
) => {
  const knex = SyncPegawai.knex();
  if (source === DEFAULT_SOURCE) {
    return knex("sync_pegawai as sync")
      .innerJoin(
        "siasn_employees as siasn",
        "sync.nip_master",
        "siasn.nip_baru"
      )
      .whereRaw("sync.skpd_id ILIKE ?", [`${skpdId}%`])
      .andWhere(conditionBuilder)
      .count("* as total")
      .first();
  }
  return knex("siasn_employees as siasn")
    .andWhere(conditionBuilder)
    .count("* as total")
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
      search = "",
      limit = DEFAULT_LIMIT,
      page = DEFAULT_PAGE,
      source = DEFAULT_SOURCE,
    } = req.query;

    if (source === DEFAULT_SOURCE && !validateOpd(res, opdId, skpd_id)) return;

    // build kondisi + search
    const condition = function () {
      conditionBuilder.call(this);
      addSearchFilter(search, this, source);
    };

    const pageNum = Number(page);
    const lim = Number(limit);

    // data dan total
    const dataQuery = createBaseQuery(skpd_id, condition, source);
    if (lim !== -1) dataQuery.limit(lim).offset((pageNum - 1) * lim);

    const [data, total] = await Promise.all([
      dataQuery,
      createCountingQuery(skpd_id, condition, source),
    ]);

    // kirim response
    if (source === DEFAULT_SOURCE) {
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
  eselonPendidikanCondition
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
    ] = await Promise.all([
      createCountingQuery(skpd_id, tmtCpnsVsPnsCondition),
      createCountingQuery(skpd_id, jenisPegawaiDPKCondition),
      createCountingQuery(skpd_id, masaKerjaStrukturalCondition),
      createCountingQuery(skpd_id, nikBelumValidCondition),
      createCountingQuery(skpd_id, pelaksanaJabatanFungsionalCondition),
      createCountingQuery(skpd_id, pendidikanFungsionalCondition),
    ]);

    const [
      tmtCpnsSiasn,
      jenisDpkSiasn,
      masaKerjaSiasn,
      nikInvalidSiasn,
      pelaksanaFungsiSiasn,
      pendidikanFungsiSiasn,
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
    ];

    res.json(hasil);
  } catch (error) {
    handleError(res, error);
  }
};

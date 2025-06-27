// completeness.controller.js
import {
  getOpdId,
  validateOpd,
  handleError,
  checkTotalPegawai,
} from "@/utils/helper/controller-helper";
const SyncPegawai = require("@/models/sync-pegawai.model");

const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;
const DEFAULT_SOURCE = "simaster";

const formatApiResponse = (page, limit, total, data) => ({
  page,
  limit,
  total: total.total,
  data,
});

const addSearchFilter = (search, query, source) => {
  if (!search) return;
  if (source === DEFAULT_SOURCE) {
    query.where("sync.nama_master", "ILIKE", `%${search}%`);
  } else {
    query.where("siasn.nama", "ILIKE", `%${search}%`);
  }
};

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
      "siasn.nip_baru as nip",
      "siasn.nama as nama",
      "siasn.jabatan_nama as jabatan",
      "siasn.unor_nama as unit_organisasi",
      "siasn.*"
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

/** Condition builders **/
const jabatanKosongCondition = function () {
  this.whereNull("siasn.jabatan_id").orWhere("siasn.jabatan_id", "");
};

const pendidikanKosongCondition = function () {
  this.whereNull("siasn.pendidikan_id").orWhere("siasn.pendidikan_id", "");
};

const tmtPnsKosongCondition = function () {
  this.where("siasn.kedudukan_hukum_id", "!=", "71")
    .andWhere("siasn.status_cpns_pns", "!=", "C")
    .andWhere(function () {
      this.whereNull("siasn.tmt_pns").orWhere("siasn.tmt_pns", "");
    });
};

const gelarKosongCondition = function () {
  this.whereIn("siasn.tingkat_pendidikan_id", [
    "20",
    "25",
    "30",
    "35",
    "40",
    "45",
    "50",
  ])
    .andWhere("siasn.gelar_depan", "")
    .andWhere("siasn.gelar_belakang", "");
};

const emailInvalidCondition = function () {
  this.whereNull("siasn.email")
    .orWhere("siasn.email", "")
    .orWhereRaw(
      "siasn.email NOT LIKE '%@%.%' OR siasn.email NOT LIKE '%_@%_.%'"
    );
};

const nomorHpInvalidCondition = function () {
  this.whereNull("siasn.nomor_hp")
    .orWhere("siasn.nomor_hp", "")
    .orWhereRaw(
      "REGEXP_REPLACE(siasn.nomor_hp, '\\s+', '', 'g') !~ '^(08[1-9][0-9]{7,10}|62[1-9][0-9]{7,11})$'"
    );
};

/** List endpoints **/
export const jabatanKosong = listController(jabatanKosongCondition);
export const pendidikanKosong = listController(pendidikanKosongCondition);
export const tmtPnsKosong = listController(tmtPnsKosongCondition);
export const gelarKosong = listController(gelarKosongCondition);
export const emailKosong = listController(emailInvalidCondition);
export const noHpKosong = listController(nomorHpInvalidCondition);

/** Dashboard Completeness **/
export const dashboardCompleteness = async (req, res) => {
  try {
    const opdId = getOpdId(req.user);
    const { skpd_id = opdId } = req.query;
    if (!validateOpd(res, opdId, skpd_id)) return;

    const totalPegawai = await checkTotalPegawai(SyncPegawai.knex(), skpd_id);

    const sims = await Promise.all([
      createCountingQuery(skpd_id, jabatanKosongCondition),
      createCountingQuery(skpd_id, pendidikanKosongCondition),
      createCountingQuery(skpd_id, tmtPnsKosongCondition),
      createCountingQuery(skpd_id, gelarKosongCondition),
      createCountingQuery(skpd_id, emailInvalidCondition),
      createCountingQuery(skpd_id, nomorHpInvalidCondition),
    ]);
    const sis = await Promise.all([
      createCountingQuery(skpd_id, jabatanKosongCondition, "siasn"),
      createCountingQuery(skpd_id, pendidikanKosongCondition, "siasn"),
      createCountingQuery(skpd_id, tmtPnsKosongCondition, "siasn"),
      createCountingQuery(skpd_id, gelarKosongCondition, "siasn"),
      createCountingQuery(skpd_id, emailInvalidCondition, "siasn"),
      createCountingQuery(skpd_id, nomorHpInvalidCondition, "siasn"),
    ]);

    const hasil = [
      {
        id: "jabatan-kosong",
        label: "Jabatan Kosong",
        description:
          "ASN memiliki jabatan fungsional/pelaksana tapi tidak ada ID referensi jabatannya.",
        value: sims[0].total,
        siasn: sis[0].total,
        totalPegawai,
        bobot: 20.0,
      },
      {
        id: "pendidikan-kosong",
        label: "Pendidikan Kosong",
        description:
          "Pendidikan terakhir kosong di data utama dan riwayat pendidikan SIASN.",
        value: sims[1].total,
        siasn: sis[1].total,
        totalPegawai,
        bobot: 20.0,
      },
      {
        id: "tmt-pns-kosong",
        label: "TMT PNS Kosong",
        description: " TMT PNS tidak tersedia di SIASN.",
        value: sims[2].total,
        siasn: sis[2].total,
        totalPegawai,
        bobot: 12.5,
      },
      {
        id: "gelar-kosong",
        label: "Gelar Kosong",
        description:
          "Gelar depan/belakang kosong, padahal memiliki ijazah D3 ke atas.",
        value: sims[3].total,
        siasn: sis[3].total,
        totalPegawai,
        bobot: 17.5,
      },
      {
        id: "email-invalid",
        label: "Email Invalid",
        description: "Email belum diisi atau formatnya tidak valid.",
        value: sims[4].total,
        siasn: sis[4].total,
        totalPegawai,
        bobot: 2.5,
      },
      {
        id: "nomor-hp-invalid",
        label: "Nomor HP Invalid",
        description:
          "Nomor handphone belum diisi, padahal dibutuhkan untuk verifikasi/WA MyASN.",
        value: sims[5].total,
        siasn: sis[5].total,
        totalPegawai,
        bobot: 2.5,
      },
    ];

    res.json(hasil);
  } catch (err) {
    handleError(res, err);
  }
};

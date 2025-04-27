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

    const condition = function () {
      conditionBuilder.call(this);
      addSearchFilter(search, this, source);
    };

    const lim = Number(limit),
      pg = Number(page);

    const dataQ = createBaseQuery(skpd_id, condition, source);
    if (lim !== -1) dataQ.limit(lim).offset((pg - 1) * lim);

    const [data, total] = await Promise.all([
      dataQ,
      createCountingQuery(skpd_id, condition, source),
    ]);

    if (source === DEFAULT_SOURCE) {
      return res.json(formatApiResponse(pg, lim, total, data));
    }
    return res.json({ total: total.total, data });
  } catch (err) {
    handleError(res, err);
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
        value: sims[0].total,
        siasn: sis[0].total,
        totalPegawai,
        bobot: 20.0,
      },
      {
        id: "pendidikan-kosong",
        label: "Pendidikan Kosong",
        value: sims[1].total,
        siasn: sis[1].total,
        totalPegawai,
        bobot: 20.0,
      },
      {
        id: "tmt-pns-kosong",
        label: "TMT PNS Kosong",
        value: sims[2].total,
        siasn: sis[2].total,
        totalPegawai,
        bobot: 12.5,
      },
      {
        id: "gelar-kosong",
        label: "Gelar Kosong",
        value: sims[3].total,
        siasn: sis[3].total,
        totalPegawai,
        bobot: 17.5,
      },
      {
        id: "email-invalid",
        label: "Email Invalid",
        value: sims[4].total,
        siasn: sis[4].total,
        totalPegawai,
        bobot: 2.5,
      },
      {
        id: "nomor-hp-invalid",
        label: "Nomor HP Invalid",
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

// consistency.controller.js
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
const tmtCpnsNipPNSCondition = function () {
  this.whereRaw(
    "TO_CHAR(TO_DATE(siasn.tmt_cpns, 'DD-MM-YYYY'),'YYYYMM') != SUBSTRING(siasn.nip_baru,9,6)"
  ).andWhereRaw(
    `siasn.kedudukan_hukum_id != '71' and siasn.kedudukan_hukum_id != '72'`
  );
};

const tglLahirNipASNCondition = function () {
  this.whereRaw(
    "TO_CHAR(TO_DATE(siasn.tanggal_lahir,'DD-MM-YYYY'),'YYYYMMDD') != SUBSTRING(siasn.nip_baru,1,8)"
  );
};

const tahunPengangkatanPPPKCondition = function () {
  this.whereRaw(
    "TO_CHAR(TO_DATE(siasn.tmt_cpns,'DD-MM-YYYY'),'YYYY') != SUBSTRING(siasn.nip_baru,9,4)"
  ).andWhereRaw("siasn.kedudukan_hukum_id IN ('71','72')");
};

const jenisKelaminPadaASNCondition = function () {
  this.whereRaw(
    `SUBSTRING(siasn.nip_baru,15,1) != CASE 
      WHEN siasn.jenis_kelamin = 'M' THEN '1'
      WHEN siasn.jenis_kelamin = 'F' THEN '2'
      ELSE NULL END`
  );
};

/** List endpoints **/
export const tmtCpnsNipPNS = listController(tmtCpnsNipPNSCondition);
export const tglLahirNipASN = listController(tglLahirNipASNCondition);
export const tahunPengangkatanPPPK = listController(
  tahunPengangkatanPPPKCondition
);
export const jenisKelaminPadaASN = listController(jenisKelaminPadaASNCondition);

/** Dashboard Consistency **/
export const dashboardConsistency = async (req, res) => {
  try {
    const opdId = getOpdId(req.user);
    const { skpd_id = opdId } = req.query;
    if (!validateOpd(res, opdId, skpd_id)) return;

    const totalPegawai = await checkTotalPegawai(SyncPegawai.knex(), skpd_id);

    const sims = await Promise.all([
      createCountingQuery(skpd_id, tmtCpnsNipPNSCondition),
      createCountingQuery(skpd_id, tglLahirNipASNCondition),
      createCountingQuery(skpd_id, tahunPengangkatanPPPKCondition),
      createCountingQuery(skpd_id, jenisKelaminPadaASNCondition),
    ]);
    const sis = await Promise.all([
      createCountingQuery(skpd_id, tmtCpnsNipPNSCondition, "siasn"),
      createCountingQuery(skpd_id, tglLahirNipASNCondition, "siasn"),
      createCountingQuery(skpd_id, tahunPengangkatanPPPKCondition, "siasn"),
      createCountingQuery(skpd_id, jenisKelaminPadaASNCondition, "siasn"),
    ]);

    const hasil = [
      {
        id: "tmt-cpns-nip-pns",
        label: "TMT CPNS vs NIP PNS",
        value: sims[0].total,
        siasn: sis[0].total,
        totalPegawai,
        bobot: 25,
      },
      {
        id: "tgl-lahir-nip-asn",
        label: "Tgl Lahir vs NIP ASN",
        value: sims[1].total,
        siasn: sis[1].total,
        totalPegawai,
        bobot: 25,
      },
      {
        id: "tahun-pengangkatan-pppk",
        label: "Tahun Pengangkatan PPPK",
        value: sims[2].total,
        siasn: sis[2].total,
        totalPegawai,
        bobot: 25,
      },
      {
        id: "jenis-kelamin-pada-asn",
        label: "Jenis Kelamin pada ASN",
        value: sims[3].total,
        siasn: sis[3].total,
        totalPegawai,
        bobot: 25,
      },
    ];

    res.json(hasil);
  } catch (err) {
    handleError(res, err);
  }
};

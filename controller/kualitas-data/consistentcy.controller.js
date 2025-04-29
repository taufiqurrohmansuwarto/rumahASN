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
        "sync.jabatan_master as jabatan"
      )
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
        id: "tmt_cpns_nip_pns",
        label: "TMT CPNS vs NIP PNS",
        value: sims[0].total,
        siasn: sis[0].total,
        totalPegawai,
        bobot: 25,
      },
      {
        id: "tgl_lahir_nip_asn",
        label: "Tgl Lahir vs NIP ASN",
        value: sims[1].total,
        siasn: sis[1].total,
        totalPegawai,
        bobot: 25,
      },
      {
        id: "tahun_pengangkatan_pppk",
        label: "Tahun Pengangkatan PPPK",
        value: sims[2].total,
        siasn: sis[2].total,
        totalPegawai,
        bobot: 25,
      },
      {
        id: "jenis_kelamin_pada_asn",
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

import {
  checkTotalPegawai,
  handleError,
} from "@/utils/helper/controller-helper";
const SyncPegawai = require("@/models/sync-pegawai.model");
const { checkOpdEntrian } = require("@/utils/helper/controller-helper");

/**
 * Membuat query untuk menghitung jumlah data berdasarkan kondisi tertentu
 * @param {string} opdId - ID OPD yang akan difilter
 * @param {function} condition - Fungsi kondisi untuk filter data
 * @param {string} countAlias - Alias untuk hasil perhitungan
 * @returns {Promise} - Query hasil perhitungan
 */
const createCountingQuery = (opdId, condition, countAlias) => {
  const knex = SyncPegawai.knex();
  return knex("sync_pegawai as sync")
    .innerJoin("siasn_employees as siasn", "sync.nip_master", "siasn.nip_baru")
    .whereRaw("sync.skpd_id ILIKE ?", [`${opdId}%`])
    .andWhere(condition)
    .count(`* as ${countAlias}`)
    .first();
};

/**
 * Menghitung jumlah pegawai dengan jabatan kosong
 * @param {string} opdId - ID OPD yang akan difilter
 * @returns {Promise} - Hasil perhitungan
 */
const countingJabatanKosong = async (opdId) => {
  return createCountingQuery(
    opdId,
    function () {
      this.whereNull("siasn.jabatan_id").orWhere("siasn.jabatan_id", "");
    },
    "jabatan_kosong"
  );
};

/**
 * Menghitung jumlah pegawai dengan pendidikan kosong
 * @param {string} opdId - ID OPD yang akan difilter
 * @returns {Promise} - Hasil perhitungan
 */
const countingPendidikanKosong = async (opdId) => {
  return createCountingQuery(
    opdId,
    function () {
      this.whereNull("siasn.pendidikan_id").orWhere("siasn.pendidikan_id", "");
    },
    "pendidikan_kosong"
  );
};

/**
 * Menghitung jumlah pegawai dengan TMT PNS kosong
 * @param {string} opdId - ID OPD yang akan difilter
 * @returns {Promise} - Hasil perhitungan
 */
const countingTmtPnsKosong = async (opdId) => {
  return createCountingQuery(
    opdId,
    function () {
      this.where("siasn.kedudukan_hukum_id", "!=", "71")
        .andWhere("siasn.status_cpns_pns", "!=", "C")
        .andWhere(function () {
          this.whereNull("siasn.tmt_pns").orWhere("siasn.tmt_pns", "");
        });
    },
    "tmt_pns_kosong"
  );
};

/**
 * Menghitung jumlah pegawai dengan gelar kosong
 * @param {string} opdId - ID OPD yang akan difilter
 * @returns {Promise} - Hasil perhitungan
 */
const countingGelarKosong = async (opdId) => {
  return createCountingQuery(
    opdId,
    function () {
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
    },
    "gelar_kosong"
  );
};

/**
 * Menghitung jumlah pegawai dengan email tidak valid
 * @param {string} opdId - ID OPD yang akan difilter
 * @returns {Promise} - Hasil perhitungan
 */
const countingEmailKosong = async (opdId) => {
  return createCountingQuery(
    opdId,
    function () {
      this.whereNull("siasn.email")
        .orWhere("siasn.email", "")
        .orWhereRaw(
          "siasn.email NOT LIKE '%@%.%' OR siasn.email NOT LIKE '%_@%_.%'"
        );
    },
    "email_invalid"
  );
};

/**
 * Menghitung jumlah pegawai dengan nomor HP tidak valid
 * @param {string} opdId - ID OPD yang akan difilter
 * @returns {Promise} - Hasil perhitungan
 */
const countingNoHpKosong = async (opdId) => {
  return createCountingQuery(
    opdId,
    function () {
      this.whereNull("siasn.nomor_hp").orWhere("siasn.nomor_hp", "")
        .orWhereRaw(`
      REGEXP_REPLACE(siasn.nomor_hp, '\\s+', '', 'g') !~ 
      '^(08[1-9][0-9]{7,10}|62[1-9][0-9]{7,11})$'
    `);
    },
    "nomor_hp_invalid"
  );
};

/**
 * Mendapatkan ID OPD berdasarkan user
 * @param {object} user - Data user yang sedang login
 * @returns {string} - ID OPD
 */
const getOpdId = (user) => {
  const { organization_id, current_role } = user;
  return current_role === "admin" ? "1" : organization_id;
};

/**
 * Validasi OPD yang dipilih
 * @param {object} res - Response object
 * @param {string} opdId - ID OPD user
 * @param {string} skpd_id - ID SKPD yang dipilih
 * @returns {boolean} - Hasil validasi
 */
const validateOpd = (res, opdId, skpd_id) => {
  const checkOpd = checkOpdEntrian(opdId, skpd_id);
  if (!checkOpd) {
    res.status(400).json({ message: "OPD tidak ditemukan" });
    return false;
  }
  return true;
};

/**
 * Membuat query untuk mendapatkan data pegawai berdasarkan kondisi tertentu
 * @param {string} skpd_id - ID SKPD yang dipilih
 * @param {function} condition - Fungsi kondisi untuk filter data
 * @param {number} limit - Batas jumlah data
 * @param {number} page - Halaman yang dipilih
 * @returns {Promise} - Query hasil pencarian
 */
const createDataQuery = (skpd_id, condition, limit, page) => {
  const knex = SyncPegawai.knex();
  const currentLimit = Number(limit);
  const offset = (page - 1) * currentLimit;
  let query;

  if (currentLimit === -1) {
    query = knex("sync_pegawai as sync")
      .select(
        "sync.nip_master",
        "sync.foto",
        "sync.nama_master",
        "sync.opd_master",
        "siasn.email",
        "siasn.nomor_hp"
      )
      .innerJoin(
        "siasn_employees as siasn",
        "sync.nip_master",
        "siasn.nip_baru"
      )
      .whereRaw("sync.skpd_id ILIKE ?", [`${skpd_id}%`])
      .andWhere(condition)
      .orderBy("sync.nama_master", "asc");
  } else {
    query = knex("sync_pegawai as sync")
      .select(
        "sync.nip_master",
        "sync.foto",
        "sync.nama_master",
        "sync.opd_master",
        "siasn.email",
        "siasn.nomor_hp"
      )
      .innerJoin(
        "siasn_employees as siasn",
        "sync.nip_master",
        "siasn.nip_baru"
      )
      .whereRaw("sync.skpd_id ILIKE ?", [`${skpd_id}%`])
      .andWhere(condition)
      .orderBy("sync.nama_master", "asc")
      .limit(currentLimit)
      .offset(offset);
  }

  return query;
};

/**
 * Fungsi untuk menambahkan filter pencarian nama jika diperlukan
 * @param {string} search - Kata kunci pencarian
 * @param {object} builder - Query builder
 */
const addSearchFilter = (search, builder) => {
  if (search) {
    builder.where("sync.nama_master", "ILIKE", `%${search}%`);
  }
};

/**
 * Fungsi untuk memformat hasil query ke format respons API
 * @param {number} page - Halaman saat ini
 * @param {number} limit - Batas jumlah data per halaman
 * @param {object} total - Hasil query total data
 * @param {array} result - Hasil query data
 * @returns {object} - Format respons API
 */
const formatApiResponse = (page, limit, total, result) => {
  return {
    page,
    limit,
    total: total.total,
    data: result,
  };
};

/**
 * API untuk mendapatkan data dashboard kelengkapan data
 */
export const dashboardCompleteness = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const totalPegawai = await checkTotalPegawai(SyncPegawai.knex(), opdId);

    const result = await Promise.all([
      countingJabatanKosong(skpd_id),
      countingPendidikanKosong(skpd_id),
      countingTmtPnsKosong(skpd_id),
      countingGelarKosong(skpd_id),
      countingEmailKosong(skpd_id),
      countingNoHpKosong(skpd_id),
    ]);

    const data = {
      jabatan_kosong: result[0].jabatan_kosong,
      pendidikan_kosong: result[1].pendidikan_kosong,
      tmt_pns_kosong: result[2].tmt_pns_kosong,
      gelar_kosong: result[3].gelar_kosong,
      email_invalid: result[4].email_invalid,
      nomor_hp_invalid: result[5].nomor_hp_invalid,
    };

    const hasil = [
      {
        id: "jabatan-kosong",
        label: "Jabatan Kosong",
        value: data.jabatan_kosong,
        total_pegawai: totalPegawai,
        bobot: 25.0,
      },
      {
        id: "pendidikan-kosong",
        label: "Pendidikan Kosong",
        value: data.pendidikan_kosong,
        total_pegawai: totalPegawai,
        bobot: 20.0,
      },
      {
        id: "tmt-pns-kosong",
        label: "TMT PNS Kosong",
        value: data.tmt_pns_kosong,
        total_pegawai: totalPegawai,
        bobot: 12.5,
      },
      {
        id: "gelar-kosong",
        label: "Gelar Kosong",
        value: data.gelar_kosong,
        total_pegawai: totalPegawai,
        bobot: 17.5,
      },
      {
        id: "email-invalid",
        label: "Email Invalid",
        value: data.email_invalid,
        total_pegawai: totalPegawai,
        bobot: 2.5,
      },
      {
        id: "nomor-hp-invalid",
        label: "Nomor HP Invalid",
        value: data.nomor_hp_invalid,
        total_pegawai: totalPegawai,
        bobot: 2.5,
      },
    ];

    return res.json(hasil);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * API untuk mendapatkan data pegawai dengan jabatan kosong
 */
export const jabatanKosong = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, search = "", limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const result = await createDataQuery(
      skpd_id,
      function () {
        this.whereNull("siasn.jabatan_id").orWhere("siasn.jabatan_id", "");
        addSearchFilter(search, this);
      },
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      function () {
        this.whereNull("siasn.jabatan_id").orWhere("siasn.jabatan_id", "");
        addSearchFilter(search, this);
      },
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * API untuk mendapatkan data pegawai dengan pendidikan kosong
 */
export const pendidikanKosong = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, search = "", limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const result = await createDataQuery(
      skpd_id,
      function () {
        this.whereNull("siasn.pendidikan_id").orWhere(
          "siasn.pendidikan_id",
          ""
        );
        addSearchFilter(search, this);
      },
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      function () {
        this.whereNull("siasn.pendidikan_id").orWhere(
          "siasn.pendidikan_id",
          ""
        );
        addSearchFilter(search, this);
      },
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * API untuk mendapatkan data pegawai dengan TMT PNS kosong
 */
export const tmtPnsKosong = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, search = "", limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const tmtPnsCondition = function () {
      this.where("siasn.kedudukan_hukum_id", "!=", "71")
        .andWhere("siasn.status_cpns_pns", "!=", "C")
        .andWhere(function () {
          this.whereNull("siasn.tmt_pns").orWhere("siasn.tmt_pns", "");
        });
      addSearchFilter(search, this);
    };

    const result = await createDataQuery(skpd_id, tmtPnsCondition, limit, page);

    const total = await createCountingQuery(skpd_id, tmtPnsCondition, "total");

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * API untuk mendapatkan data pegawai dengan gelar kosong
 */
export const gelarKosong = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, search = "", limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

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
      addSearchFilter(search, this);
    };

    const result = await createDataQuery(
      skpd_id,
      gelarKosongCondition,
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      gelarKosongCondition,
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * API untuk mendapatkan data pegawai dengan email tidak valid
 */
export const emailKosong = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, search = "", limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const emailInvalidCondition = function () {
      this.whereNull("siasn.email")
        .orWhere("siasn.email", "")
        .orWhereRaw(
          "siasn.email NOT LIKE '%@%.%' OR siasn.email NOT LIKE '%_@%_.%'"
        );
      addSearchFilter(search, this);
    };

    const result = await createDataQuery(
      skpd_id,
      emailInvalidCondition,
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      emailInvalidCondition,
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * API untuk mendapatkan data pegawai dengan nomor HP tidak valid
 */
export const noHpKosong = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId, search = "", limit = 10, page = 1 } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

    const noHpInvalidCondition = function () {
      this.whereNull("siasn.nomor_hp").orWhere("siasn.nomor_hp", "")
        .orWhereRaw(`
      REGEXP_REPLACE(siasn.nomor_hp, '\\s+', '', 'g') !~ 
      '^(08[1-9][0-9]{7,10}|62[1-9][0-9]{7,11})$'
    `);

      addSearchFilter(search, this);
    };

    const result = await createDataQuery(
      skpd_id,
      noHpInvalidCondition,
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      noHpInvalidCondition,
      "total"
    );

    return res.json(formatApiResponse(page, limit, total, result));
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * API untuk mendapatkan data pegawai yang belum memiliki SKP tahun berjalan
 */
export const belumSkpTahunBerjalan = async (req, res) => {
  try {
    // Implementasi akan ditambahkan nanti
  } catch (error) {
    handleError(res, error);
  }
};

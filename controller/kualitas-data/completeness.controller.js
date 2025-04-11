import { handleError } from "@/utils/helper/controller-helper";
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
    .join("siasn_employees as siasn", "sync.nip_master", "siasn.nip_baru")
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
      this.where("siasn.kedudukan_hukum_id", "!=", "71").andWhere(function () {
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
      this.whereNull("siasn.nomor_hp")
        .orWhere("siasn.nomor_hp", "")
        .orWhereRaw("siasn.nomor_hp !~ '^08[0-9]{8,11}$'");
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
  return knex("sync_pegawai as sync")
    .join("siasn_employees as siasn", "sync.nip_master", "siasn.nip_baru")
    .whereRaw("sync.skpd_id ILIKE ?", [`${skpd_id}%`])
    .andWhere(condition)
    .orderBy("sync.nama_master", "asc")
    .limit(limit)
    .offset((page - 1) * limit);
};

/**
 * API untuk mendapatkan data dashboard kelengkapan data
 */
export const dashboardCompleteness = async (req, res) => {
  try {
    const opdId = getOpdId(req?.user);
    const { skpd_id = opdId } = req?.query;

    if (!validateOpd(res, opdId, skpd_id)) return;

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
      },
      {
        id: "pendidikan-kosong",
        label: "Pendidikan Kosong",
        value: data.pendidikan_kosong,
      },
      {
        id: "tmt-pns-kosong",
        label: "TMT PNS Kosong",
        value: data.tmt_pns_kosong,
      },
      {
        id: "gelar-kosong",
        label: "Gelar Kosong",
        value: data.gelar_kosong,
      },
      {
        id: "email-invalid",
        label: "Email Invalid",
        value: data.email_invalid,
      },
      {
        id: "nomor-hp-invalid",
        label: "Nomor HP Invalid",
        value: data.nomor_hp_invalid,
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
        this.whereNull("siasn.jabatan_id")
          .orWhere("siasn.jabatan_id", "")
          .where((builder) => {
            if (search) {
              builder.where("sync.nama_master", "ILIKE", `%${search}%`);
            }
          });
      },
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      function () {
        this.whereNull("siasn.jabatan_id")
          .orWhere("siasn.jabatan_id", "")
          .where((builder) => {
            if (search) {
              builder.where("sync.nama_master", "ILIKE", `%${search}%`);
            }
          });
      },
      "total"
    );

    const data = {
      page,
      limit,
      total: total.total,
      data: result,
    };

    return res.json(data);
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
      },
      "total"
    );

    const data = {
      page,
      limit,
      total: total.total,
      data: result,
    };

    return res.json(data);
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

    const result = await createDataQuery(
      skpd_id,
      function () {
        this.where("siasn.kedudukan_hukum_id", "!=", "71").andWhere(
          function () {
            this.whereNull("siasn.tmt_pns").orWhere("siasn.tmt_pns", "");
          }
        );
      },
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      function () {
        this.where("siasn.kedudukan_hukum_id", "!=", "71").andWhere(
          function () {
            this.whereNull("siasn.tmt_pns").orWhere("siasn.tmt_pns", "");
          }
        );
      },
      "total"
    );

    const data = {
      page,
      limit,
      total: total.total,
      data: result,
    };

    return res.json(data);
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

    const result = await createDataQuery(
      skpd_id,
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
          .andWhere("siasn.gelar_belakang", "")
          .where((builder) => {
            if (search) {
              builder.where("sync.nama_master", "ILIKE", `%${search}%`);
            }
          });
      },
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
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
          .andWhere("siasn.gelar_belakang", "")
          .where((builder) => {
            if (search) {
              builder.where("sync.nama_master", "ILIKE", `%${search}%`);
            }
          });
      },
      "total"
    );

    const data = {
      page,
      limit,
      total: total.total,
      data: result,
    };

    return res.json(data);
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

    const result = await createDataQuery(
      skpd_id,
      function () {
        this.whereNull("siasn.email")
          .orWhere("siasn.email", "")
          .orWhereRaw(
            "siasn.email NOT LIKE '%@%.%' OR siasn.email NOT LIKE '%_@%_.%'"
          )
          .where((builder) => {
            if (search) {
              builder.where("sync.nama_master", "ILIKE", `%${search}%`);
            }
          });
      },
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      function () {
        this.whereNull("siasn.email")
          .orWhere("siasn.email", "")
          .orWhereRaw(
            "siasn.email NOT LIKE '%@%.%' OR siasn.email NOT LIKE '%_@%_.%'"
          )
          .where((builder) => {
            if (search) {
              builder.where("sync.nama_master", "ILIKE", `%${search}%`);
            }
          });
      },
      "total"
    );

    const data = {
      page,
      limit,
      total: total.total,
      data: result,
    };

    return res.json(data);
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

    const result = await createDataQuery(
      skpd_id,
      function () {
        this.whereNull("siasn.nomor_hp")
          .orWhere("siasn.nomor_hp", "")
          .orWhereRaw("siasn.nomor_hp !~ '^08[0-9]{8,11}$'");
      },
      limit,
      page
    );

    const total = await createCountingQuery(
      skpd_id,
      function () {
        this.whereNull("siasn.nomor_hp")
          .orWhere("siasn.nomor_hp", "")
          .orWhereRaw("siasn.nomor_hp !~ '^08[0-9]{8,11}$'");
      },
      "total"
    );

    const data = {
      page,
      limit,
      total: total.total,
      data: result,
    };

    return res.json(data);
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

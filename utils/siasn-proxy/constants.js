/**
 * Constants untuk SIASN Proxy synchronization
 */

module.exports = {
  // Pagination
  INITIAL_FETCH_LIMIT: 10,
  BATCH_FETCH_LIMIT: 500,
  BATCH_INSERT_SIZE: 100,
  MAX_QUERY_LIMIT: 100,

  // Database
  PROXY_SCHEMA: "siasn_proxy",

  // Tables
  TABLES: {
    PANGKAT: "proxy_pangkat",
    PENGADAAN: "siasn_pengadaan_proxy",
    PENSIUN: "proxy_pensiun",
    PG_AKADEMIK: "proxy_pg_akademik",
    PG_PROFESI: "proxy_pg_profesi",
    SKK: "proxy_skk",
    // Future: MUTASI, JABATAN, dll
  },

  // Status Usulan
  STATUS_USULAN: {
    DRAFT: 0,
    DIAJUKAN: 1,
    DISETUJUI: 2,
    DITOLAK: 3,
  },

  // Jenis Layanan
  JENIS_LAYANAN: {
    KENAIKAN_PANGKAT: 3,
    PENGADAAN: 2,
    PEMBERHENTIAN: 6,
    // Future: MUTASI, JABATAN, dll
  },
};

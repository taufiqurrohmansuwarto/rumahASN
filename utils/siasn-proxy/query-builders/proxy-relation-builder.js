/**
 * Query builder untuk handle relasi di proxy tables
 */

/**
 * Apply relasi pegawai dengan filter skpd_id
 * Supports hierarchical access: if opdId = "123", includes "123", "1234", "12345", etc
 * @param {Object} queryBuilder - Objection.js query builder
 * @param {String} opdId - OPD/SKPD ID untuk filter
 * @param {Boolean} includeChildren - Include children OPD (default: true)
 * @returns {Object} Modified query builder
 */
const applyPegawaiRelation = (queryBuilder, opdId, includeChildren = true) => {
  if (!opdId) {
    return queryBuilder;
  }

  // Join dengan sync_pegawai
  let query = queryBuilder.withGraphJoined("pegawai");

  // Filter by skpd_id
  if (includeChildren && opdId !== "1") {
    // Use ILIKE for hierarchical access (includes children, case-insensitive)
    query = query.where("pegawai.skpd_id", "ilike", `${opdId}%`);
  } else if (opdId !== "1") {
    // Exact match only
    query = query.where("pegawai.skpd_id", opdId);
  }
  // If opdId === "1" (admin), no filter applied

  // Select specific pegawai fields
  query = query.modifyGraph("pegawai", (builder) => {
    builder.select(
      "id",
      "foto",
      "nip_master",
      "nama_master",
      "skpd_id",
      "opd_master",
      "jabatan_master",
      "status_master"
    );
  });

  return query;
};

/**
 * Parse periode filter
 * Supports formats:
 * - "12-2025" or "2025-12" (YYYY-MM or MM-YYYY)
 * - "December 2025" (Month Name YYYY)
 * - "2025-12-01T00:00:00Z" (ISO date)
 *
 * @param {String} periode - Periode input
 * @returns {String|null} Normalized periode (YYYY-MM-DD format for database)
 */
const parsePeriodeFilter = (periode) => {
  if (!periode) {
    return null;
  }

  const periodeStr = String(periode).trim();

  // Format: ISO date (2025-12-01T00:00:00Z)
  if (periodeStr.includes("T")) {
    return periodeStr.split("T")[0]; // Return YYYY-MM-DD
  }

  // Format: YYYY-MM or MM-YYYY (with dash)
  if (periodeStr.includes("-")) {
    const parts = periodeStr.split("-");
    if (parts.length === 2) {
      const [first, second] = parts;
      // Check if YYYY-MM (first is year)
      if (first.length === 4) {
        return `${first}-${second.padStart(2, "0")}-01`;
      }
      // Check if MM-YYYY (second is year)
      if (second.length === 4) {
        return `${second}-${first.padStart(2, "0")}-01`;
      }
    }
  }

  // Format: "December 2025" or "Dec 2025"
  const monthNames = {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12",
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dec: "12",
  };

  const lowerPeriode = periodeStr.toLowerCase();
  for (const [month, num] of Object.entries(monthNames)) {
    if (lowerPeriode.includes(month)) {
      const year = periodeStr.match(/\d{4}/)?.[0];
      if (year) {
        return `${year}-${num}-01`;
      }
    }
  }

  // If can't parse, return as is
  return periodeStr;
};

/**
 * Apply periode filter
 * @param {Object} queryBuilder - Objection.js query builder
 * @param {String} periode - Periode filter
 * @returns {Object} Modified query builder
 */
const applyPeriodeFilter = (queryBuilder, periode) => {
  if (!periode) {
    return queryBuilder;
  }

  const parsedPeriode = parsePeriodeFilter(periode);
  if (!parsedPeriode) {
    return queryBuilder;
  }

  // Filter by periode (YYYY-MM-DD format, using ILIKE for partial match)
  return queryBuilder.where(
    "periode",
    "ilike",
    `${parsedPeriode.substring(0, 7)}%`
  );
};

/**
 * Apply filter untuk proxy pangkat dengan relasi
 * @param {Object} queryBuilder - Objection.js query builder
 * @param {Object} filters - Filter object { nip, nama, skpd_id, periode }
 * @param {String} opdId - OPD ID dari user (for authorization)
 * @param {Object} options - Options { includeChildren: true }
 * @returns {Object} Modified query builder
 */
const applyProxyPangkatFilters = (
  queryBuilder,
  filters = {},
  opdId = null,
  options = {}
) => {
  const { includeChildren = true } = options;
  let query = queryBuilder;

  // Apply pegawai relation dengan filter skpd_id (authorization)
  if (opdId && opdId !== "1") {
    // Non-admin: filter by opdId dengan hierarchical access (123%)
    query = applyPegawaiRelation(query, opdId, includeChildren);
  } else if (filters.skpd_id) {
    // Jika ada filter skpd_id spesifik dari query params
    // Untuk admin yang ingin filter by skpd_id tertentu
    query = applyPegawaiRelation(query, filters.skpd_id, includeChildren);
  } else if (opdId === "1") {
    // Admin tanpa filter skpd_id, tetap join tapi tidak filter
    query = query
      .withGraphJoined("pegawai")
      .modifyGraph("pegawai", (builder) => {
        builder.select(
          "id",
          "foto",
          "nip_master",
          "nama_master",
          "skpd_id",
          "opd_master",
          "jabatan_master",
          "status_master"
        );
      });
  }

  // Apply text filters
  if (filters.nip) {
    query = query.where(
      "siasn_proxy.proxy_pangkat.nip",
      "ilike",
      `%${filters.nip}%`
    );
  }

  if (filters.nama) {
    query = query.where(
      "siasn_proxy.proxy_pangkat.nama",
      "ilike",
      `%${filters.nama}%`
    );
  }

  // Apply periode filter
  if (filters.periode) {
    query = applyPeriodeFilter(query, filters.periode);
  }

  // Apply other filters
  if (filters.status_usulan !== undefined && filters.status_usulan !== null) {
    query = query.where(
      "siasn_proxy.proxy_pangkat.status_usulan",
      filters.status_usulan
    );
  }

  if (filters.jenis_layanan_nama) {
    query = query.where(
      "siasn_proxy.proxy_pangkat.jenis_layanan_nama",
      "ilike",
      `%${filters.jenis_layanan_nama}%`
    );
  }

  return query;
};

module.exports = {
  applyPegawaiRelation,
  parsePeriodeFilter,
  applyPeriodeFilter,
  applyProxyPangkatFilters,
};

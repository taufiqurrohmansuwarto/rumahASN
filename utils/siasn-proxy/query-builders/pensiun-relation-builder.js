/**
 * Query builder helpers for Pensiun/Pemberhentian proxy with relations and filters
 */

const { isRootOpd } = require("../helpers/opd-hierarchy-helper");

/**
 * Apply pegawai relation with authorization filter
 * @param {Object} queryBuilder - Objection.js query builder
 * @param {string} opdId - Organization ID from user
 * @param {boolean} includeChildren - Whether to include child organizations (hierarchical access)
 * @returns {Object} Modified query builder
 */
const applyPegawaiRelation = (queryBuilder, opdId, includeChildren = true) => {
  let query = queryBuilder.withGraphJoined("pegawai");

  // Apply authorization filter
  if (includeChildren && opdId !== "1") {
    // Hierarchical access: include opdId and all children (using ILIKE for prefix matching)
    query = query.where("pegawai.skpd_id", "ilike", `${opdId}%`);
  } else if (opdId !== "1") {
    // Exact match only
    query = query.where("pegawai.skpd_id", opdId);
  }
  // If opdId === "1" (admin), no filter is applied

  // Select specific fields from pegawai to avoid overfetching
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
 * Parse periode filter string (e.g., "12-2025" or "2025-12-01")
 * @param {string} periode - Periode filter string
 * @returns {Object|null} Parsed periode or null if invalid
 */
const parsePeriodeFilter = (periode) => {
  if (!periode) return null;

  // Format: "MM-YYYY" or "YYYY-MM-DD"
  const parts = periode.split("-");

  if (parts.length === 2) {
    // MM-YYYY or YYYY-MM
    const [first, second] = parts;
    if (first.length === 4) {
      // YYYY-MM
      return { year: first, month: second.padStart(2, "0") };
    } else {
      // MM-YYYY
      return { month: first.padStart(2, "0"), year: second };
    }
  } else if (parts.length === 3) {
    // YYYY-MM-DD
    return { year: parts[0], month: parts[1].padStart(2, "0") };
  }

  return null;
};

/**
 * Apply periode filter to query
 * @param {Object} queryBuilder - Objection.js query builder
 * @param {string} periode - Periode filter string
 * @returns {Object} Modified query builder
 */
const applyPeriodeFilter = (queryBuilder, periode) => {
  const parsed = parsePeriodeFilter(periode);
  if (!parsed) return queryBuilder;

  // Use ILIKE for case-insensitive matching
  const periodePattern = `${parsed.year}-${parsed.month}%`;
  return queryBuilder.where(
    "siasn_proxy.proxy_pensiun.tgl_usulan",
    "ilike",
    periodePattern
  );
};

/**
 * Apply filters to proxy pensiun query with authorization
 * @param {Object} queryBuilder - Base query builder
 * @param {Object} filters - Filter object
 * @param {string} opdId - Organization ID from user (for authorization)
 * @returns {Object} Modified query builder
 */
const applyProxyPensiunFilters = (queryBuilder, filters = {}, opdId) => {
  let query = queryBuilder;

  // Apply pegawai relation with authorization (hierarchical access by default)
  query = applyPegawaiRelation(query, opdId, true);

  // Basic filters (direct on proxy_pensiun table)
  if (filters.nip) {
    query = query.where("siasn_proxy.proxy_pensiun.nip", "ilike", `%${filters.nip}%`);
  }

  if (filters.nama) {
    query = query.where("siasn_proxy.proxy_pensiun.nama", "ilike", `%${filters.nama}%`);
  }

  if (filters.status_usulan) {
    query = query.where(
      "siasn_proxy.proxy_pensiun.status_usulan",
      filters.status_usulan
    );
  }

  if (filters.jenis_layanan_nama) {
    query = query.where(
      "siasn_proxy.proxy_pensiun.jenis_layanan_nama",
      "ilike",
      `%${filters.jenis_layanan_nama}%`
    );
  }

  if (filters.detail_layanan_nama) {
    query = query.where(
      "siasn_proxy.proxy_pensiun.detail_layanan_nama",
      "ilike",
      `%${filters.detail_layanan_nama}%`
    );
  }

  // Periode filter (using tgl_usulan)
  if (filters.periode) {
    query = applyPeriodeFilter(query, filters.periode);
  }

  // SKPD filter (on related pegawai table, using ILIKE for hierarchical)
  if (filters.skpd_id && !isRootOpd(filters.skpd_id)) {
    query = query.where("pegawai.skpd_id", "ilike", `${filters.skpd_id}%`);
  }

  return query;
};

module.exports = {
  applyPegawaiRelation,
  parsePeriodeFilter,
  applyPeriodeFilter,
  applyProxyPensiunFilters,
};


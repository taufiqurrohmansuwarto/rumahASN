/**
 * Query builder helpers for Peremajaan Gelar Profesi proxy with relations and filters
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
 * Apply filters to proxy pg_profesi query with authorization
 * @param {Object} queryBuilder - Base query builder
 * @param {Object} filters - Filter object
 * @param {string} opdId - Organization ID from user (for authorization)
 * @returns {Object} Modified query builder
 */
const applyProxyPgProfesiFilters = (queryBuilder, filters = {}, opdId) => {
  let query = queryBuilder;

  // Apply pegawai relation with authorization (hierarchical access by default)
  query = applyPegawaiRelation(query, opdId, true);

  // Basic filters (direct on proxy_pg_profesi table)
  if (filters.nip) {
    query = query.where(
      "siasn_proxy.proxy_pg_profesi.nip",
      "ilike",
      `%${filters.nip}%`
    );
  }

  if (filters.nama) {
    query = query.where(
      "siasn_proxy.proxy_pg_profesi.nama",
      "ilike",
      `%${filters.nama}%`
    );
  }

  if (filters.status_usulan) {
    query = query.where(
      "siasn_proxy.proxy_pg_profesi.status_usulan",
      filters.status_usulan
    );
  }

  if (filters.detail_layanan_nama) {
    query = query.where(
      "siasn_proxy.proxy_pg_profesi.detail_layanan_nama",
      "ilike",
      `%${filters.detail_layanan_nama}%`
    );
  }

  if (filters.jenis_layanan_nama) {
    query = query.where(
      "siasn_proxy.proxy_pg_profesi.jenis_layanan_nama",
      "ilike",
      `%${filters.jenis_layanan_nama}%`
    );
  }

  // SKPD filter (on related pegawai table, using ILIKE for hierarchical)
  if (filters.skpd_id && !isRootOpd(filters.skpd_id)) {
    query = query.where("pegawai.skpd_id", "ilike", `${filters.skpd_id}%`);
  }

  return query;
};

module.exports = {
  applyPegawaiRelation,
  applyProxyPgProfesiFilters,
};


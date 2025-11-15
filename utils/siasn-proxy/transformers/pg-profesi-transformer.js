/**
 * Transform single peremajaan gelar profesi item from API to database format
 * @param {Object} item - Raw item from API
 * @returns {Object} Transformed item
 */
const transformPgProfesiItem = (item) => ({
  id: item?.id || null,
  nama: item?.nama || null,
  nip: item?.nip || null,
  pns_id: item?.pns_id || null,
  tipe_pegawai: item?.tipe_pegawai || null,
  detail_layanan: item?.detail_layanan || null,
  detail_layanan_nama: item?.detail_layanan_nama || null,
  jenis_layanan_nama: item?.jenis_layanan_nama || null,
  sub_layanan: item?.sub_layanan || null,
  unor_verifikator: item?.unor_verifikator || null,
  unor_verifikator_nama: item?.unor_verifikator_nama || null,
  nip_verifikator: item?.nip_verifikator || null,
  nama_verifikator: item?.nama_verifikator || null,
  status_usulan: item?.status_usulan || null,
  status_usulan_nama: item?.status_usulan_nama || null,
  sumber: item?.sumber || null,
  tgl_usulan: item?.tgl_usulan || null,
  tmt_cpns: item?.tmt_cpns || null,
  tgl_tolak_bkn: item?.tgl_tolak_bkn || null,
  usulan_data: item?.usulan_data || null,
  dokumen_usulan: item?.dokumen_usulan || null,
  id_riwayat_update: item?.id_riwayat_update || null,
  id_riwayat: item?.id_riwayat || null,
  tipe_usulan: item?.tipe_usulan || null,
  tipe: item?.tipe || null,
  alasan_tolak_id: item?.alasan_tolak_id || null,
  alasan_tolak_nama: item?.alasan_tolak_nama || null,
  alasan_tolak_tambahan: item?.alasan_tolak_tambahan || null,
  rekomendasi_approval: item?.rekomendasi_approval || null,
  pns_id_approval: item?.pns_id_approval || null,
  nip_approval: item?.nip_approval || null,
  nama_approval: item?.nama_approval || null,
  unor_approval_id: item?.unor_approval_id || null,
  unor_approval_nama: item?.unor_approval_nama || null,
  instansi_id: item?.instansi_id || null,
  instansi_nama: item?.instansi_nama || null,
  kanreg_id: item?.kanreg_id || null,
  periode: item?.periode || null,
  periode_id: item?.periode_id || null,
});

/**
 * Transform array of peremajaan gelar profesi items
 * @param {Array} items - Raw items from API
 * @returns {Array} Transformed items
 */
const transformPgProfesiData = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map(transformPgProfesiItem).filter((item) => item.id !== null);
};

module.exports = {
  transformPgProfesiItem,
  transformPgProfesiData,
};


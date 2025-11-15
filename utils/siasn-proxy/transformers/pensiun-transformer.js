/**
 * Transform single pemberhentian/pensiun item from API to database format
 * @param {Object} item - Raw item from API
 * @returns {Object} Transformed item
 */
const transformPensiunItem = (item) => ({
  id: item?.id || null,
  layanan_id: item?.layanan_id || null,
  layanan_nama: item?.layanan_nama || null,
  sub_layanan_id: item?.sub_layanan_id || null,
  sub_layanan_nama: item?.sub_layanan_nama || null,
  detail_layanan_id: item?.detail_layanan_id || null,
  detail_layanan_nama: item?.detail_layanan_nama || null,
  pns_id: item?.pns_id || null,
  nip: item?.nip || null,
  nama: item?.nama || null,
  instansi_id: item?.instansi_id || null,
  instansi_nama: item?.instansi_nama || null,
  usulan_data: item?.usulan_data || null,
  dokumen_usulan: item?.dokumen_usulan || null,
  jenis_henti_id: item?.jenis_henti_id || null,
  jenis_henti_nama: item?.jenis_henti_nama || null,
  status_aktif: item?.status_aktif || null,
  status_usulan: item?.status_usulan || null,
  tgl_usulan: item?.tgl_usulan || null,
  created_by: item?.created_by || null,
  created_by_nip: item?.created_by_nip || null,
  created_by_nama: item?.created_by_nama || null,
  approval_tgl: item?.approval_tgl || null,
  approval_id: item?.approval_id || null,
  approval_nip: item?.approval_nip || null,
  approval_nama: item?.approval_nama || null,
  path_pertek: item?.path_pertek || null,
  path_pertek_multi: item?.path_pertek_multi || null,
  path_sk_multi: item?.path_sk_multi || null,
  path_sk: item?.path_sk || null,
  path_sk_preview: item?.path_sk_preview || null,
  kirim_teken_usul_tgl: item?.kirim_teken_usul_tgl || null,
  tgl_pengiriman_kelayanan: item?.tgl_pengiriman_kelayanan || null,
  updated_from_bkn_at: item?.updated_from_bkn_at || null,
  alasan_tolak_id: item?.alasan_tolak_id || null,
  alasan_tolak_tambahan: item?.alasan_tolak_tambahan || null,
  notes: item?.notes || null,
  updated_at: item?.updated_at || null,
  deleted_by: item?.deleted_by || null,
  sk_nomor: item?.sk_nomor || null,
  sk_tgl: item?.sk_tgl || null,
  keterangan: item?.keterangan || null,
  sk_signer_id: item?.sk_signer_id || null,
  sk_signer_nama: item?.sk_signer_nama || null,
  sk_signer_nip: item?.sk_signer_nip || null,
  usulan_taspen: item?.usulan_taspen || null,
});

/**
 * Transform array of pemberhentian/pensiun items
 * @param {Array} items - Raw items from API
 * @returns {Array} Transformed items
 */
const transformPensiunData = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map(transformPensiunItem).filter((item) => item.id !== null);
};

module.exports = {
  transformPensiunItem,
  transformPensiunData,
};


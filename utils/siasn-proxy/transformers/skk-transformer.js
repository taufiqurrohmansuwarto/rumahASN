/**
 * Transform single SKK item from API to database format
 * @param {Object} item - Raw item from API
 * @returns {Object} Transformed item
 */
const transformSkkItem = (item) => ({
  id: item?.id || null,
  jenis_layanan: item?.jenis_layanan || null,
  sub_layanan: item?.sub_layanan || null,
  detail_layanan: item?.detail_layanan || null,
  jenis_layanan_nama: item?.jenis_layanan_nama || null,
  no_surat_usulan: item?.no_surat_usulan || null,
  tgl_surat_usulan: item?.tgl_surat_usulan || null,
  path_surat_usulan: item?.path_surat_usulan || null,
  pns_id: item?.pns_id || null,
  nip: item?.nip || null,
  nama: item?.nama || null,
  instansi_id: item?.instansi_id || null,
  instansi_nama: item?.instansi_nama || null,
  provinsi_nama: item?.provinsi_nama || null,
  usulan_data: item?.usulan_data || null,
  dokumen_usulan: item?.dokumen_usulan || null,
  status_usulan: item?.status_usulan || null,
  tgl_usulan: item?.tgl_usulan || null,
  message: item?.message || null,
  deleted_at: item?.deleted_at || null,
  no_sk: item?.no_sk || null,
  tgl_sk: item?.tgl_sk || null,
  pejabat_ttd_sk: item?.pejabat_ttd_sk || null,
  typeSignature: item?.typeSignature || null,
  nama_waris: item?.nama_waris || null,
  tempat_ditetapkan: item?.tempat_ditetapkan || null,
  jabatan_ttd: item?.jabatan_ttd || null,
  status_cpns_pns: item?.status_cpns_pns || null,
  pangkat_gol: item?.pangkat_gol || null,
  masa_kerja_gol: item?.masa_kerja_gol || null,
  mulai_tgl: item?.mulai_tgl || null,
});

/**
 * Transform array of SKK items
 * @param {Array} items - Raw items from API
 * @returns {Array} Transformed items
 */
const transformSkkData = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map(transformSkkItem).filter((item) => item.id !== null);
};

module.exports = {
  transformSkkItem,
  transformSkkData,
};


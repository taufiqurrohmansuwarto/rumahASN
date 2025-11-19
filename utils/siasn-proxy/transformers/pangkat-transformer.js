/**
 * Transform data kenaikan pangkat dari API SIASN Proxy ke database schema
 */

const { log } = require("@/utils/logger");

/**
 * Transform single item
 * @param {Object} item - Raw data from API
 * @returns {Object} Transformed data matching DB schema
 */
const transformPangkatItem = (item) => {
  // Warn jika ID null
  if (!item?.id) {
    log.warn(
      `[TRANSFORM] Record tanpa ID ditemukan: NIP=${item?.nip}, Nama=${item?.nama}`
    );
  }

  return {
    // Primary Key
    id: item?.id || null,

  // Layanan Info
  jenis_layanan: item?.jenis_layanan || null,
  sub_layanan: item?.sub_layanan || null,
  detail_layanan: item?.detail_layanan || null,
  detail_layanan_nama: item?.detail_layanan_nama || null,
  jenis_layanan_nama: item?.jenis_layanan_nama || null,

  // PNS Info
  pns_id: item?.pns_id || null,
  nip: item?.nip || null,
  nama: item?.nama || null,

  // JSONB Data
  usulan_data: item?.usulan_data || null,
  dokumen_usulan: item?.dokumen_usulan || null,

  // Status
  status_usulan: item?.status_usulan || null,
  status_aktif: item?.status_aktif || null,
  status_paraf_pertek: item?.status_paraf_pertek || null,
  status_ttd_paraf_pertek: item?.status_ttd_paraf_pertek || null,
  status_paraf_sk: item?.status_paraf_sk || null,
  status_ttd_sk: item?.status_ttd_sk || null,

  // Tanggal
  tgl_usulan: item?.tgl_usulan || null,
  tgl_pengiriman_kelayanan: item?.tgl_pengiriman_kelayanan || null,
  tgl_update_layanan: item?.tgl_update_layanan || null,
  tgl_surat_usulan: item?.tgl_surat_usulan || null,
  tgl_surat_keluar: item?.tgl_surat_keluar || null,
  tgl_paraf_sk: item?.tgl_paraf_sk || null,
  tgl_ttd_sk: item?.tgl_ttd_sk || null,
  tgl_sk: item?.tgl_sk || null,
  tgl_pertek: item?.tgl_pertek || null,
  periode: item?.periode || null,

  // Instansi
  instansi_id: item?.instansi_id || null,
  instansi_nama: item?.instansi_nama || null,
  instansi_induk_id: item?.instansi_induk_id || null,
  instansi_induk_nama: item?.instansi_induk_nama || null,
  satuan_kerja_induk_id: item?.satuan_kerja_induk_id || null,
  satuan_kerja_induk_nama: item?.satuan_kerja_induk_nama || null,
  provinsi_nama: item?.provinsi_nama || null,

  // Dokumen Paths
  path_pertek: item?.path_pertek || null,
  path_ttd_pertek: item?.path_ttd_pertek || null,
  path_surat_usulan: item?.path_surat_usulan || null,
  path_paraf_sk: item?.path_paraf_sk || null,
  path_ttd_sk: item?.path_ttd_sk || null,
  path_sk: item?.path_sk || null,
  path_sk_kolektif: item?.path_sk_kolektif || null,
  path_sk_lampiran: item?.path_sk_lampiran || null,

  // Pejabat
  pejabat_paraf_id: item?.pejabat_paraf_id || null,
  pejabat_ttd_id: item?.pejabat_ttd_id || null,
  pejabat_paraf_sk: item?.pejabat_paraf_sk || null,
  pejabat_ttd_sk: item?.pejabat_ttd_sk || null,

  // Surat & Nomor
  no_surat_usulan: item?.no_surat_usulan || null,
  no_surat_keluar: item?.no_surat_keluar || null,
  no_sk: item?.no_sk || null,
  no_urut: item?.no_urut || null,
  no_pertek: item?.no_pertek || null,

  // Kenaikan Pangkat Specific
  jenis_kp_id: item?.jenis_kp_id || null,
  jenis_pegawai_id: item?.jenis_pegawai_id || null,

  // Uraian & Keterangan
  keterangan: item?.keterangan || null,
  uraian_perbaikan: item?.uraian_perbaikan || null,
  uraian_pembatalan: item?.uraian_pembatalan || null,

  // Riwayat
  nama_tabel_riwayat: item?.nama_tabel_riwayat || null,
  id_riwayat_update: item?.id_riwayat_update || null,

  // Alasan Tolak
  alasan_tolak_id: item?.alasan_tolak_id || null,
  alasan_tolak_tambahan: item?.alasan_tolak_tambahan || null,

  // Referensi
  referensi_instansi: item?.referensi_instansi || null,

  // Flags & Counters
  generated_nomor: item?.generated_nomor || false,
  is_otomatis: item?.is_otomatis || null,
  counter_bts: item?.counter_bts || null,

  // Approval & Pengusul
  nip_pengaju: item?.nip_pengaju || null,
  nip_approval: item?.nip_approval || null,
  nama_approval: item?.nama_approval || null,
  nip_approval_perbaikan: item?.nip_approval_perbaikan || null,
  pns_id_pengusul: item?.pns_id_pengusul || null,
  kanreg_id_pengusul: item?.kanreg_id_pengusul || null,

    // Additional Status
    StatusData: item?.StatusData || null,
  };
};

/**
 * Transform array of items
 * @param {Array} items - Array of raw data from API
 * @returns {Array} Array of transformed data
 */
const transformPangkatData = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.map(transformPangkatItem);
};

module.exports = {
  transformPangkatItem,
  transformPangkatData,
};

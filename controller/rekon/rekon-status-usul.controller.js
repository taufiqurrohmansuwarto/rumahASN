import { handleError } from "@/utils/helper/controller-helper";
import StatusUsul from "@/models/ref_siasn/status-usul.model";

const result = [
  { id: "1", nama: "Input Berkas" },
  { id: "2", nama: "Berkas Disimpan (Terverifikasi)" },
  { id: "3", nama: "Surat Usulan" },
  { id: "4", nama: "Approval Surat Usulan" },
  { id: "5", nama: "Perbaikan Dokumen" },
  { id: "6", nama: "Tidak Memenuhi Syarat" },
  { id: "7", nama: "Menunggu Cetak SK – Menyetujui" },
  { id: "8", nama: "Menunggu Cetak SK – Perbaikan Pertek" },
  { id: "9", nama: "Menunggu Cetak SK – Pembatalan Pertek" },
  { id: "10", nama: "Cetak SK" },
  { id: "11", nama: "Profil PNS telah diperbaharui" },
  { id: "12", nama: "Terima Usulan" },
  { id: "13", nama: "Validasi Usulan – Tidak Memenuhi Syarat" },
  { id: "14", nama: "Validasi Usulan – Perbaikan Dokumen" },
  { id: "15", nama: "Validasi Usulan – Disetujui" },
  { id: "16", nama: "Berkas Disetujui" },
  { id: "17", nama: "Menunggu Paraf – Paraf Pertek" },
  { id: "18", nama: "Menunggu Paraf – Gagal Paraf Pertek" },
  { id: "19", nama: "Sdh di paraf - Pertek" },
  { id: "20", nama: "Menunggu Tanda tangan- TTD Pertek" },
  { id: "21", nama: "Berkas Ditolak - TTD Pertek" },
  { id: "22", nama: "Sdh di TTD - Pertek" },
  { id: "23", nama: "Surat Keluar" },
  { id: "24", nama: "Perbaikan Pertek (Menunggu Approval Instansi)" },
  { id: "25", nama: "Terima Usulan Penetapan – Pembatalan" },
  { id: "26", nama: "Pembatalan Pertek (Menunggu Approval Instansi)" },
  { id: "27", nama: "Menunggu SK – Paraf / TTE" },
  { id: "28", nama: "Setuju Paraf SK" },
  { id: "29", nama: "Tolak TTD SK" },
  { id: "30", nama: "Setuju TTD SK" },
  { id: "31", nama: "Telah Update di Profile PNS" },
  { id: "32", nama: "Pembuatan SK Berhasil" },
  { id: "33", nama: "Menunggu Layanan" },
  { id: "34", nama: "Perbaikan Dokumen - Menunggu Approval" },
  { id: "35", nama: "Tolak Paraf SK" },
  { id: "36", nama: "Menunggu TTD - SK" },
  { id: "37", nama: "Approval Perbaikan Pertek" },
  { id: "38", nama: "Approval Pembatalan Pertek" },
  { id: "39", nama: "Perbaikan SK" },
  { id: "40", nama: "Berkas Disimpan (Terverifikasi) - Perbaikan SK" },
  { id: "41", nama: "Validasi Usulan - Perbaikan SK" },
  { id: "42", nama: "Validasi Usulan - Perbaikan SK (Disetujui)" },
  { id: "43", nama: "Menunggu Paraf - Perbaikan SK" },
  { id: "44", nama: "Menunggu TTD - Perbaikan SK" },
  { id: "45", nama: "Sudah TTD - Perbaikan SK" },
  { id: "46", nama: "Menunggu TTD SK - Instansi" },
  { id: "47", nama: "Tolak TTD SK - Instansi" },
  { id: "48", nama: "Setuju TTD SK - Instansi" },
  { id: "49", nama: "Sudah TTD - SK" },
  { id: "50", nama: "Perbaikan Dokumen - MYSAPK" },
  { id: "51", nama: "Input Berkas - Perbaikan MySAPK " },
  { id: "52", nama: "Perbaikan Dokumen - Approval" },
  { id: "53", nama: "Setuju TTD Pertek" },
  { id: "55", nama: "Approval Tingkat Provinsi" },
  { id: "56", nama: "Perbaikan Approval" },
  { id: "57", nama: "Perbaikan Pertek" },
  { id: "58", nama: "Validasi Usulan - Perbaikan Pertek" },
  { id: "59", nama: "Menunggu Buat Sk" },
  { id: "60", nama: "Proses Persidangan" },
  { id: "61", nama: "Input Berkas - SK PNS" },
  { id: "62", nama: "Menunggu TTD SK PNS - Instansi" },
  { id: "63", nama: "Setuju TTD Digital SK PNS" },
  { id: "64", nama: "Pembuatan SK Basah PNS Berhasil" },
  { id: "65", nama: "Pembatalan NIP/Pertek" },
  { id: "66", nama: "Perbaikan SK Provinsi" },
  { id: "67", nama: "Perbaikan Dokumen - BTS" },
  { id: "99", nama: "Usulan Dihapus" },
];

export const syncStatusUsul = async (req, res) => {
  try {
    const knex = StatusUsul.knex();
    //     remove first
    await knex.delete().from("ref_siasn.status_usul");
    //     insert new
    await knex.insert(result).into("ref_siasn.status_usul");
    res.json({ status: true, message: "Status Usul berhasil diambil" });
  } catch (error) {
    handleError(res, error);
  }
};

export const getStatusUsul = async (req, res) => {
  try {
    const knex = StatusUsul.knex();
    await knex.delete().from("ref_siasn.status_usul");
    await knex.insert(result).into("ref_siasn.status_usul");
    const result = await knex.select("*").from("ref_siasn.status_usul");
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

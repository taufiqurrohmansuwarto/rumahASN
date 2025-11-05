import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { trim } from "lodash";
import * as XLSX from "xlsx";
import { getPengadaanParuhWaktu } from "@/services/siasn-services";

const jenisJabatan = (data) => {
  if (data?.jenis_jabatan_id === 2) {
    return trim(
      `${data?.jabatan_fungsional_nama || ""} ${
        data?.sub_jabatan_fungsional_nama || ""
      }`
    );
  } else if (data?.jenis_jabatan_id === 4) {
    return data?.jabatan_fungsional_umum_nama || "-";
  } else {
    return "-";
  }
};

export const useDownloadParuhWaktu = (query) => {
  const { mutate: downloadData, isLoading: isMutating } = useMutation({
    mutationFn: (queryParams) =>
      getPengadaanParuhWaktu({ ...queryParams, limit: -1 }),
    onSuccess: (result) => {
      const excelData =
        result?.data?.map((item, index) => ({
          No: index + 1,
          ID: item?.id || "-",
          NIP: item?.nip || "-",
          "Nama Lengkap": item?.nama || "-",
          "Gelar Depan": item?.detail?.usulan_data?.data?.glr_depan || "-",
          "Gelar Belakang": item?.detail?.usulan_data?.data?.glr_belakang || "-",
          "Nama Lengkap (Gelar)": trim(
            `${item?.detail?.usulan_data?.data?.glr_depan || ""} ${
              item?.nama || ""
            } ${item?.detail?.usulan_data?.data?.glr_belakang || ""}`
          ),
          "Tanggal Lahir": item?.detail?.usulan_data?.data?.tgl_lahir
            ? dayjs(item.detail.usulan_data.data.tgl_lahir).format("DD/MM/YYYY")
            : "-",
          "Tempat Lahir": item?.detail?.usulan_data?.data?.tempat_lahir || "-",
          Gaji: item?.gaji || item?.detail?.usulan_data?.data?.gaji_pokok || "0",
          "Nomor Peserta":
            item?.no_peserta || item?.detail?.usulan_data?.data?.no_peserta || "-",
          Periode: item?.detail?.periode || "-",
          "Jenis Formasi": item?.detail?.jenis_formasi_nama || "-",
          Pendidikan: item?.detail?.usulan_data?.data?.pendidikan_pertama_nama || "-",
          "Tanggal Lulus": item?.detail?.usulan_data?.data?.tgl_tahun_lulus
            ? dayjs(item.detail.usulan_data.data.tgl_tahun_lulus).format(
                "DD/MM/YYYY"
              )
            : "-",
          "TMT CPNS": item?.detail?.usulan_data?.data?.tmt_cpns || "-",
          "Pangkat/Golongan": item?.detail?.usulan_data?.data?.golongan_nama || "-",
          "Unit Kerja SIASN": item?.unor_siasn || "-",
          "Unit Kerja SIASN ID": item?.unor_id_siasn || "-",
          "Unit Kerja SIMASTER": item?.unor_simaster || "-",
          "Unit Kerja SIMASTER ID": item?.unor_id_simaster || "-",
          "Tgl. Usulan": item?.detail?.tgl_usulan
            ? dayjs(item.detail.tgl_usulan).format("DD/MM/YYYY")
            : "-",
          "Unor Pertek": trim(
            `${item?.detail?.usulan_data?.data?.unor_nama || ""} - ${
              item?.detail?.usulan_data?.data?.unor_induk_nama || ""
            }`
          ),
          "Nomer Pertek": item?.detail?.no_pertek || "-",
          "Tanggal Pertek": item?.detail?.tgl_pertek
            ? dayjs(item.detail.tgl_pertek).format("DD/MM/YYYY")
            : "-",
          Jabatan: jenisJabatan(item?.detail?.usulan_data?.data),
          "Status Usulan": item?.status_usulan?.nama || item?.detail?.status_usulan || "-",
          "Kode Pendidikan": item?.detail?.usulan_data?.data?.tk_pendidikan_id || "-",
          "Jenis Jabatan": item?.detail?.usulan_data?.data?.jenis_jabatan_nama || "-",
          "Alasan Tolak Tambahan": item?.detail?.alasan_tolak_tambahan || "-",
          "Tgl. Kontrak Mulai": item?.detail?.usulan_data?.data?.tgl_kontrak_mulai || "-",
          "Tgl. Kontrak Akhir": item?.detail?.usulan_data?.data?.tgl_kontrak_akhir || "-",
          "No. SK": item?.detail?.no_sk || "-",
          "Tgl. SK": item?.detail?.tgl_sk
            ? dayjs(item.detail.tgl_sk).format("DD/MM/YYYY")
            : "-",
          Instansi: item?.detail?.instansi_nama || "-",
          "Satuan Kerja": item?.detail?.usulan_data?.data?.satuan_kerja_nama || "-",
          Keterangan: item?.detail?.keterangan || "-",
          "Path Pertek": item?.detail?.path_ttd_pertek || "-",
          "Path SK": item?.detail?.path_ttd_sk || "-",
        })) || [];

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      const columnWidths = [
        { wch: 5 }, // No
        { wch: 40 }, // ID
        { wch: 20 }, // NIP
        { wch: 30 }, // Nama Lengkap
        { wch: 15 }, // Gelar Depan
        { wch: 15 }, // Gelar Belakang
        { wch: 35 }, // Nama Lengkap (Gelar)
        { wch: 15 }, // Tanggal Lahir
        { wch: 20 }, // Tempat Lahir
        { wch: 15 }, // Gaji
        { wch: 25 }, // Nomor Peserta
        { wch: 10 }, // Periode
        { wch: 25 }, // Jenis Formasi
        { wch: 30 }, // Pendidikan
        { wch: 15 }, // Tanggal Lulus
        { wch: 15 }, // TMT CPNS
        { wch: 20 }, // Pangkat/Golongan
        { wch: 50 }, // Unit Kerja SIASN
        { wch: 40 }, // Unit Kerja SIASN ID
        { wch: 50 }, // Unit Kerja SIMASTER
        { wch: 20 }, // Unit Kerja SIMASTER ID
        { wch: 15 }, // Tgl. Usulan
        { wch: 50 }, // Unor Pertek
        { wch: 25 }, // Nomer Pertek
        { wch: 15 }, // Tanggal Pertek
        { wch: 40 }, // Jabatan
        { wch: 25 }, // Status Usulan
        { wch: 15 }, // Kode Pendidikan
        { wch: 30 }, // Jenis Jabatan
        { wch: 40 }, // Alasan Tolak Tambahan
        { wch: 15 }, // Tgl. Kontrak Mulai
        { wch: 15 }, // Tgl. Kontrak Akhir
        { wch: 30 }, // No. SK
        { wch: 15 }, // Tgl. SK
        { wch: 40 }, // Instansi
        { wch: 40 }, // Satuan Kerja
        { wch: 40 }, // Keterangan
        { wch: 60 }, // Path Pertek
        { wch: 60 }, // Path SK
      ];
      worksheet["!cols"] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, "Pegawai Paruh Waktu");

      const currentDate = dayjs().format("YYYY-MM-DD_HH-mm-ss");
      const filename = `Pegawai-Paruh-Waktu_${currentDate}.xlsx`;

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const excelBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(excelBlob, filename);
      message.success("Berhasil mengunduh data Excel");
    },
    onError: (error) => {
      console.error("Download error:", error);
      message.error("Gagal mengunduh data");
    },
  });

  const handleDownload = () => {
    downloadData(query);
  };

  return { handleDownload, isMutating };
};


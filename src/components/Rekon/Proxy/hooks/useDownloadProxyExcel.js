import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { utils, write } from "xlsx";
import {
  getProxyPangkatList,
  getProxyPensiunList,
  getProxyPgAkademikList,
  getProxyPgProfesiList,
  getProxySkkList,
} from "@/services/siasn-proxy.services";

const serviceFunctions = {
  pangkat: getProxyPangkatList,
  pensiun: getProxyPensiunList,
  pg_akademik: getProxyPgAkademikList,
  pg_profesi: getProxyPgProfesiList,
  skk: getProxySkkList,
};

const excelMappers = {
  pangkat: (item, index) => ({
    No: index + 1,
    NIP: item.pegawai?.nip_master || item.nip || "-",
    Nama: item.pegawai?.nama_master || item.nama || "-",
    Jabatan: item.pegawai?.jabatan_master || "-",
    "Unit Kerja": item.pegawai?.opd_master || "-",
    "Jenis KP": item.detail_layanan_nama || "-",
    "Golongan Lama": item.usulan_data?.data?.golongan_lama_nama || "-",
    "Golongan Baru": item.usulan_data?.data?.golongan_baru_nama || "-",
    "TMT Pangkat": item.usulan_data?.data?.tmt_golongan_baru
      ? dayjs(item.usulan_data?.data?.tmt_golongan_baru).format("DD/MM/YYYY")
      : "-",
    Periode: item.periode
      ? dayjs(item.periode).format("MMMM YYYY")
      : "-",
    "Status Usulan": item.status_usulan_nama || "-",
    "Nomor SK": item.no_sk || "-",
    "Nomor Pertek": item.no_pertek || "-",
    "Alasan Tolak": item.alasan_tolak_tambahan || "-",
    "Path TTD Pertek": item.path_ttd_pertek || "-",
    "Path TTD SK": item.path_ttd_sk || "-",
    "Status Pegawai": item.pegawai?.status_master || "-",
  }),
  pensiun: (item, index) => ({
    No: index + 1,
    NIP: item.pegawai?.nip_master || item.nip || "-",
    Nama: item.pegawai?.nama_master || item.nama || "-",
    Jabatan: item.pegawai?.jabatan_master || "-",
    "Unit Kerja": item.pegawai?.opd_master || "-",
    "Jenis Pensiun": item.detail_layanan_nama || "-",
    "Golongan KPP": item.usulan_data?.data?.golongan_kpp_nama || "-",
    "TMT Pensiun": item.usulan_data?.data?.tmt_pensiun
      ? dayjs(item.usulan_data?.data?.tmt_pensiun).format("DD/MM/YYYY")
      : "-",
    "Nomor SK": item.sk_nomor || "-",
    "Tanggal SK": item.sk_tgl && item.sk_tgl !== "0001-01-01T00:00:00.000Z"
      ? dayjs(item.sk_tgl).format("DD/MM/YYYY")
      : "-",
    "Status Usulan": item.status_usulan_nama || "-",
    "Path Pertek": item.path_pertek || "-",
    "Path SK": item.path_sk || "-",
    "Alasan Tolak": item.alasan_tolak_tambahan || "-",
    "Status Pegawai": item.pegawai?.status_master || "-",
  }),
  pg_akademik: (item, index) => ({
    No: index + 1,
    NIP: item.pegawai?.nip_master || item.nip || "-",
    Nama: item.pegawai?.nama_master || item.nama || "-",
    Jabatan: item.pegawai?.jabatan_master || "-",
    "Unit Kerja": item.pegawai?.opd_master || "-",
    "Jenis Layanan": item.detail_layanan_nama || "-",
    "Gelar Depan": item.gelar_depan || "-",
    "Gelar Belakang": item.gelar_belakang || "-",
    Pendidikan: item.pendidikan_nama || "-",
    "Nomor SK": item.no_sk || "-",
    "Tanggal SK": item.tgl_sk || "-",
    "Periode ID": item.periode_id || "-",
    "Status Usulan": item.status_usulan_nama || "-",
    "Alasan Tolak": item.alasan_tolak_tambahan || "-",
    "Status Pegawai": item.pegawai?.status_master || "-",
  }),
  pg_profesi: (item, index) => ({
    No: index + 1,
    NIP: item.pegawai?.nip_master || item.nip || "-",
    Nama: item.pegawai?.nama_master || item.nama || "-",
    Jabatan: item.pegawai?.jabatan_master || "-",
    "Unit Kerja": item.pegawai?.opd_master || "-",
    "Jenis Layanan": item.detail_layanan_nama || "-",
    "Gelar Profesi": item.gelar_profesi || "-",
    "Nomor Sertifikat": item.no_sertifikat || "-",
    "Tanggal Sertifikat": item.tgl_sertifikat || "-",
    "Periode ID": item.periode_id || "-",
    "Status Usulan": item.status_usulan_nama || "-",
    "Alasan Tolak": item.alasan_tolak_tambahan || "-",
    "Status Pegawai": item.pegawai?.status_master || "-",
  }),
  skk: (item, index) => ({
    No: index + 1,
    NIP: item.pegawai?.nip_master || item.nip || "-",
    Nama: item.pegawai?.nama_master || item.nama || "-",
    Jabatan: item.pegawai?.jabatan_master || "-",
    "Unit Kerja": item.pegawai?.opd_master || "-",
    "Jenis Layanan": item.jenis_layanan_nama || "-",
    "Nomor SK": item.no_sk || "-",
    "Tanggal SK": item.tgl_sk && item.tgl_sk !== "0001-01-01T00:00:00.000Z"
      ? dayjs(item.tgl_sk).format("DD/MM/YYYY")
      : "-",
    "Status Usulan": item.status_usulan_nama || "-",
    Message: item.message || "-",
    "Status Pegawai": item.pegawai?.status_master || "-",
  }),
};

const titles = {
  pangkat: "Kenaikan Pangkat",
  pensiun: "Pensiun",
  pg_akademik: "PG Akademik",
  pg_profesi: "PG Profesi",
  skk: "SKK",
};

export const useDownloadProxyExcel = (type, query) => {
  const { mutate: downloadData, isLoading: isDownloading } = useMutation({
    mutationFn: (queryParams) => {
      const serviceFunction = serviceFunctions[type];
      return serviceFunction({ ...queryParams, limit: -1 });
    },
    onSuccess: (result) => {
      const mapper = excelMappers[type];
      const excelData = result?.data?.map(mapper) || [];

      const workbook = utils.book_new();
      const worksheet = utils.json_to_sheet(excelData);

      // Auto width
      const maxWidth = 50;
      const colWidths = Object.keys(excelData[0] || {}).map((key) => {
        const maxLen = Math.max(
          key.length,
          ...excelData.map((row) => String(row[key] || "").length)
        );
        return { wch: Math.min(maxLen + 2, maxWidth) };
      });
      worksheet["!cols"] = colWidths;

      utils.book_append_sheet(workbook, worksheet, titles[type]);

      const currentDate = dayjs().format("YYYY-MM-DD_HH-mm-ss");
      const filename = `Proxy-${titles[type]}_${currentDate}.xlsx`;

      const excelBuffer = write(workbook, {
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

  return { handleDownload, isDownloading };
};


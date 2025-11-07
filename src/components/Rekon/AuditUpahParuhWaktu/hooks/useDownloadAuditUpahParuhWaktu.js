import { getAuditLogOperatorGajiPW } from "@/services/siasn-services";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { message } from "antd";
import * as XLSX from "xlsx";

const useDownloadAuditUpahParuhWaktu = () => {
  const { mutate: downloadLog, isLoading: isMutating } = useMutation({
    mutationFn: (data) => getAuditLogOperatorGajiPW(data),
    onSuccess: (data) => {
      // Transform data untuk Excel
      const excelData =
        data?.data?.map((item, index) => {
          const oldGaji = item.old_data?.gaji
            ? parseInt(item.old_data.gaji).toLocaleString("id-ID")
            : "0";
          const newGaji = item.new_data?.gaji
            ? parseInt(item.new_data.gaji).toLocaleString("id-ID")
            : "0";
          const perubahan =
            item.new_data?.gaji && item.old_data?.gaji
              ? (
                  parseInt(item.new_data.gaji) - parseInt(item.old_data.gaji)
                ).toLocaleString("id-ID")
              : "0";

          const oldUnor = item.old_data?.unor_pk_text || "-";
          const newUnor = item.new_data?.unor_pk_text || "-";
          const unorChanged = oldUnor !== newUnor;

          return {
            No: index + 1,
            "ID Log": item.id,
            "Nama Operator": item.user?.username || "-",
            "NIP Operator": item.user?.employee_number || "-",
            "Nama Pegawai": item.detail?.nama || "-",
            "NIP Pegawai": item.detail?.nip || "-",
            "Gaji Lama": oldGaji,
            "Gaji Baru": newGaji,
            "Perubahan Gaji": perubahan,
            "Unit Kerja PK Lama": oldUnor,
            "Unit Kerja PK Baru": newUnor,
            "Status Perubahan Unit Kerja PK": unorChanged ? "Berubah" : "Tidak Berubah",
            "IP Address": item.ip_address || "N/A",
            "Luar Perangkat Daerah": item.new_data?.luar_perangkat_daerah
              ? "Ya"
              : "Tidak",
            Aksi: item.action === "update" ? "Update" : item.action,
            "Waktu Perubahan": dayjs(item.change_at).format(
              "DD MMMM YYYY, HH:mm:ss"
            ),
            Tanggal: dayjs(item.change_at).format("DD/MM/YYYY"),
            Waktu: dayjs(item.change_at).format("HH:mm:ss"),
          };
        }) || [];

      // Buat workbook baru
      const workbook = XLSX.utils.book_new();

      // Buat worksheet dari data
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 5 }, // No
        { wch: 10 }, // ID Log
        { wch: 30 }, // Nama Operator
        { wch: 20 }, // NIP Operator
        { wch: 30 }, // Nama Pegawai
        { wch: 20 }, // NIP Pegawai
        { wch: 15 }, // Gaji Lama
        { wch: 15 }, // Gaji Baru
        { wch: 15 }, // Perubahan Gaji
        { wch: 50 }, // Unit Kerja PK Lama
        { wch: 50 }, // Unit Kerja PK Baru
        { wch: 25 }, // Status Perubahan Unit Kerja PK
        { wch: 18 }, // IP Address
        { wch: 20 }, // Luar Perangkat Daerah
        { wch: 10 }, // Aksi
        { wch: 30 }, // Waktu Perubahan
        { wch: 12 }, // Tanggal
        { wch: 10 }, // Waktu
      ];
      worksheet["!cols"] = columnWidths;

      // Set header styling
      const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          font: {
            bold: true,
            color: { rgb: "FFFFFF" },
            size: 12,
            name: "Calibri",
          },
          fill: {
            fgColor: { rgb: "FF4500" },
            patternType: "solid",
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
          border: {
            top: { style: "medium", color: { rgb: "FFFFFF" } },
            bottom: { style: "medium", color: { rgb: "FFFFFF" } },
            left: { style: "thin", color: { rgb: "FFFFFF" } },
            right: { style: "thin", color: { rgb: "FFFFFF" } },
          },
        };
      }

      // Set alternating row colors for better readability
      const dataRange = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let row = 1; row <= dataRange.e.r; row++) {
        for (let col = dataRange.s.c; col <= dataRange.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cellAddress]) continue;

          // Alternating row colors
          const isEvenRow = row % 2 === 0;
          worksheet[cellAddress].s = {
            font: {
              color: { rgb: "1A1A1A" },
              size: 10,
              name: "Calibri",
            },
            fill: {
              fgColor: { rgb: isEvenRow ? "F8F9FA" : "FFFFFF" },
              patternType: "solid",
            },
            alignment: {
              horizontal: col === 0 ? "center" : "left",
              vertical: "center",
              wrapText: col === 9 || col === 10, // Wrap text for Unit Kerja PK columns
            },
            border: {
              top: { style: "thin", color: { rgb: "E8E8E8" } },
              bottom: { style: "thin", color: { rgb: "E8E8E8" } },
              left: { style: "thin", color: { rgb: "E8E8E8" } },
              right: { style: "thin", color: { rgb: "E8E8E8" } },
            },
          };
        }
      }

      // Freeze first row (header)
      worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

      // Set print settings
      worksheet["!margins"] = {
        left: 0.7,
        right: 0.7,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      };

      // Auto filter
      worksheet["!autofilter"] = { ref: worksheet["!ref"] };

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Audit Upah Paruh Waktu"
      );

      // Generate filename with current date
      const currentDate = dayjs().format("YYYY-MM-DD_HH-mm-ss");
      const filename = `Audit-Upah-Paruh-Waktu_${currentDate}.xlsx`;

      // Write and download
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

  return { downloadLog, isMutating };
};

export default useDownloadAuditUpahParuhWaktu;


import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { getOperatorGajiPW } from "@/services/siasn-services";
import { getOpdFasilitator } from "@/services/master.services";
import { utils, write } from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { findUnorName } from "../utils/helpers";

// Hook untuk download semua data operator
export const useDownloadOperator = (unor) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => getOperatorGajiPW({}),
    onSuccess: async (data) => {
      try {
        if (!data || !Array.isArray(data) || data.length === 0) {
          message.warning("Tidak ada data untuk diunduh");
          return;
        }

        // Ambil data unor dari cache atau fetch jika belum ada
        let unorData = unor;
        if (!unorData) {
          const cachedUnor = queryClient.getQueryData(["unor-fasilitator"]);
          if (cachedUnor) {
            unorData = cachedUnor;
          } else {
            unorData = await getOpdFasilitator();
          }
        }

        // Format data untuk Excel
        const excelData = data.map((item, index) => {
          const idParts = item.user_id?.split("|") || [];
          const username =
            idParts.length > 1
              ? `${item.user?.username || "-"} - ${idParts[1]}`
              : item.user?.username || "-";

          const unorName = findUnorName(item.unor_id, unorData);

          return {
            No: index + 1,
            "ID Operator": item.id,
            "Unit Organisasi ID": item.unor_id,
            "Unit Organisasi": unorName || item.unit_organisasi || "-",
            "User ID": item.user_id,
            "Nama Operator": username,
            Username: item.user?.username || "-",
            Group: item.user?.group || "-",
            From: item.user?.from || "-",
            "Status Kepegawaian": item.user?.status_kepegawaian || "-",
            "Nama Jabatan": item.user?.nama_jabatan || "-",
            "Perangkat Daerah": item.user?.perangkat_daerah_detail || "-",
            "Status Lock": item.is_locked ? "Locked" : "Unlocked",
            "Locked By": item.locked_by || "-",
            "Username Pengunci": item.pengunci?.username || item.locked_by || "-",
            "Tanggal Lock": item.locked_at
              ? dayjs(item.locked_at).format("DD/MM/YYYY HH:mm:ss")
              : "-",
            "Tanggal Dibuat": dayjs(item.created_at).format(
              "DD/MM/YYYY HH:mm:ss"
            ),
            "Tanggal Diupdate": dayjs(item.updated_at).format(
              "DD/MM/YYYY HH:mm:ss"
            ),
          };
        });

        // Buat workbook dan worksheet
        const workbook = utils.book_new();
        const worksheet = utils.json_to_sheet(excelData);

        // Set column widths
        const columnWidths = [
          { wch: 5 }, // No
          { wch: 12 }, // ID Operator
          { wch: 18 }, // Unit Organisasi ID
          { wch: 50 }, // Unit Organisasi
          { wch: 30 }, // User ID
          { wch: 40 }, // Nama Operator
          { wch: 30 }, // Username
          { wch: 15 }, // Group
          { wch: 20 }, // From
          { wch: 20 }, // Status Kepegawaian
          { wch: 40 }, // Nama Jabatan
          { wch: 50 }, // Perangkat Daerah
          { wch: 15 }, // Status Lock
          { wch: 30 }, // Locked By
          { wch: 30 }, // Username Pengunci
          { wch: 20 }, // Tanggal Lock
          { wch: 20 }, // Tanggal Dibuat
          { wch: 20 }, // Tanggal Diupdate
        ];
        worksheet["!cols"] = columnWidths;

        // Style header
        const headerRange = utils.decode_range(worksheet["!ref"]);
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
          const cellAddress = utils.encode_cell({ r: 0, c: col });
          if (!worksheet[cellAddress]) continue;
          worksheet[cellAddress].s = {
            font: {
              bold: true,
              color: { rgb: "FFFFFF" },
              size: 12,
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
          };
        }

        utils.book_append_sheet(
          workbook,
          worksheet,
          "Operator Upah Paruh Waktu"
        );

        // Generate file
        const excelBuffer = write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        const excelBlob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const currentDate = dayjs().format("YYYY-MM-DD_HH-mm-ss");
        const filename = `Operator-Upah-Paruh-Waktu_${currentDate}.xlsx`;

        saveAs(excelBlob, filename);
        message.success("Berhasil mengunduh data Excel");
      } catch (error) {
        console.error("Error creating Excel file:", error);
        message.error("Gagal mengunduh data");
      }
    },
    onError: (error) => {
      console.error("Download error:", error);
      message.error("Gagal mengunduh data");
    },
  });
};


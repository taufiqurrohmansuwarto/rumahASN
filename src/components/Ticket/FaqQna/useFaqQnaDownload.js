import { getFaqQna } from "@/services/tickets-ref.services";
import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { utils, write } from "xlsx";

function useFaqQnaDownload() {
  const { mutate: downloadFaq, isLoading: isDownloading } = useMutation({
    mutationFn: (params) => getFaqQna(params),
    onSuccess: (response) => {
      if (response?.data?.length > 0) {
        const excelData = response.data.map((item, index) => ({
          No: index + 1,
          Pertanyaan: item.question,
          Jawaban: item.answer,
          Status: item.is_active ? "Aktif" : "Tidak Aktif",
          "Sub Kategori": item.sub_categories
            ?.map((sc) => `${sc.name} (${sc.category?.name})`)
            .join(", "),
          "Tanggal Efektif": item.effective_date
            ? dayjs(item.effective_date).format("DD-MM-YYYY")
            : "-",
          "Tanggal Kadaluarsa": item.expired_date
            ? dayjs(item.expired_date).format("DD-MM-YYYY")
            : "-",
          "Referensi Peraturan": item.regulation_ref || "-",
          Tags: Array.isArray(item.tags) ? item.tags.join(", ") : "-",
          "Confidence Score": item.confidence_score || "-",
          Versi: item.version || 1,
          "Dibuat Tanggal": dayjs(item.created_at).format("DD-MM-YYYY HH:mm"),
        }));

        const workbook = utils.book_new();
        const worksheet = utils.json_to_sheet(excelData);

        // Set column widths
        worksheet["!cols"] = [
          { wch: 5 }, // No
          { wch: 50 }, // Pertanyaan
          { wch: 60 }, // Jawaban
          { wch: 12 }, // Status
          { wch: 30 }, // Sub Kategori
          { wch: 15 }, // Tanggal Efektif
          { wch: 18 }, // Tanggal Kadaluarsa
          { wch: 30 }, // Referensi
          { wch: 20 }, // Tags
          { wch: 12 }, // Score
          { wch: 8 }, // Versi
          { wch: 18 }, // Created
        ];

        utils.book_append_sheet(workbook, worksheet, "FAQ QnA");

        const currentDate = dayjs().format("YYYY-MM-DD_HH-mm-ss");
        const filename = `FAQ-QnA_${currentDate}.xlsx`;

        const excelBuffer = write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(blob, filename);
        message.success("Berhasil mengunduh data Excel");
      } else {
        message.warning("Tidak ada data untuk diunduh");
      }
    },
    onError: () => {
      message.error("Gagal mengunduh data");
    },
  });

  return { downloadFaq, isDownloading };
}

export default useFaqQnaDownload;


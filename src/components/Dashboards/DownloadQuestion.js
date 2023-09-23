import { excelReport } from "@/services/admin.services";
import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";
import React from "react";

function DownloadQuestion() {
  const { mutateAsync: downloadExcelReport, isLoading } = useMutation(
    () => excelReport(),
    {
      onSuccess: () => message.success("Berhasil download"),
      onError: () => message.error("Gagal download"),
    }
  );

  const handleDownload = async () => {
    const data = await downloadExcelReport();

    if (data) {
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "file.xlsx";
      link.click();

      URL.revokeObjectURL(url);
    }
  };

  return (
    <Button disabled={isLoading} loading={isLoading} onClick={handleDownload}>
      Unduh Data
    </Button>
  );
}

export default DownloadQuestion;

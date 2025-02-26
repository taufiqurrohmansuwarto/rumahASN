import { getDokumenFasilitator } from "@/services/master.services";
import { FileExcelOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button } from "antd";

const downloadDocuments = async () => {
  const response = await getDokumenFasilitator();
  const url = window.URL.createObjectURL(
    new Blob([response.data], { type: "application/zip" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "documents.zip");
  document.body.appendChild(link);
  link.click();
  link.remove();
};

function DownloadDokumenFasilitator() {
  const mutation = useMutation(downloadDocuments);

  return (
    <Button
      icon={<FileExcelOutlined />}
      type="primary"
      loading={mutation.isLoading}
      onClick={() => mutation.mutate()}
    >
      SK Pelaksana
    </Button>
  );
}

export default DownloadDokumenFasilitator;

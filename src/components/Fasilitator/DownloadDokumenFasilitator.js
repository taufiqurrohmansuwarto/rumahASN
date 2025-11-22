import { getDokumenFasilitator } from "@/services/master.services";
import { IconDownload } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { Button, Tooltip } from "antd";

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
    <Tooltip title="Unduh SK Pelaksana (ZIP)">
      <Button
        type="primary"
        loading={mutation.isLoading}
        icon={<IconDownload size={16} />}
        onClick={() => mutation.mutate()}
      />
    </Tooltip>
  );
}

export default DownloadDokumenFasilitator;

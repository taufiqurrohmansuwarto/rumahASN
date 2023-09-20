import { downloadRatings } from "@/services/webinar.services";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Tooltip, message } from "antd";

function DownloadRating({ id }) {
  const { mutateAsync: download, isLoading } = useMutation((data) =>
    downloadRatings(id)
  );

  const handleDownload = async () => {
    try {
      const data = await download(id);
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
      message.success("Berhasil mengunduh data rating");
    } catch (error) {
      console.log(error);
      message.error("Gagal mengunduh data rating");
    }
  };

  return (
    <Tooltip title="Unduh Rating">
      <Button
        loading={isLoading}
        disabled={isLoading}
        onClick={handleDownload}
        type="primary"
        icon={<CloudDownloadOutlined />}
      >
        Rating
      </Button>
    </Tooltip>
  );
}

export default DownloadRating;

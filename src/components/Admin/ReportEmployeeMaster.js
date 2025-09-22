import { reportSimasterEmployees } from "@/services/admin.services";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";
import FileSaver from "file-saver";

function ReportEmployeeMaster() {
  const { mutateAsync: download, isLoading: loadingDownload } = useMutation(
    () => reportSimasterEmployees()
  );

  const handleClick = async () => {
    try {
      const data = await download();

      //       array buffer to excell download
      const blob = new Blob([data], { type: "application/vnd.ms-excel" });
      FileSaver.saveAs(blob, "rekap-full-simaster.xlsx");

      message.success("Berhasil mengunduh rekap full SIMASTER");
    } catch (error) {
      message.error("Gagal mengunduh rekap full SIMASTER");
    }
  };

  return (
    <Button
      type="primary"
      onClick={handleClick}
      loading={loadingDownload}
      disabled={loadingDownload}
      icon={<CloudDownloadOutlined />}
    >
      Unduh Data SIMASTER
    </Button>
  );
}

export default ReportEmployeeMaster;

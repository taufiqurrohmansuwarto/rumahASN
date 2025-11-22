import { reportSimasterEmployees } from "@/services/admin.services";
import { IconDownload } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { Button, message, Tooltip } from "antd";
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
    <Tooltip title="Unduh Data SIMASTER (Excel)">
      <Button
        type="primary"
        onClick={handleClick}
        loading={loadingDownload}
        icon={<IconDownload size={16} />}
      />
    </Tooltip>
  );
}

export default ReportEmployeeMaster;

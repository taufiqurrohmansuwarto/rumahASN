import { downloadEmployees } from "@/services/master.services";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Modal, message } from "antd";
import { useRouter } from "next/router";

function DownloadASN() {
  const router = useRouter();
  const { mutateAsync: downloadASN, isLoading: isloadingDownloadASN } =
    useMutation(
      () =>
        downloadEmployees({
          organizationId: router.query.opd_id,
        }),
      {}
    );

  const handleDownload = async () => {
    try {
      const data = await downloadASN();
      if (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "data_komparasi_pegawai.xlsx";
        link.click();

        URL.revokeObjectURL(url);
      }
    } catch (error) {
      message.error("Terjadi kesalahan");
    }
  };

  const downloadConfirmation = () => {
    Modal.confirm({
      title: "Unduh ASN",
      content:
        "Apakah anda yakin ingin mengunduh data pegawai?. Data yang akan diunduh adalah sesuai dengan tanggal terakhir sinkronisasi data.",
      onOk: handleDownload,
    });
  };

  return (
    <Button
      onClick={downloadConfirmation}
      type="primary"
      icon={<CloudDownloadOutlined />}
    >
      Unduh ASN
    </Button>
  );
}

export default DownloadASN;

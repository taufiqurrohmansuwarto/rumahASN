import {
  checkDocumentPerbaikan,
  downloadDocumentPerbaikan,
} from "@/services/berkas.services";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, message, Space, Typography } from "antd";
import { useState } from "react";
import { useRouter } from "next/router";
import {
  checkDocumentByNip,
  downloadDocumentByNip,
} from "@/services/master.services";

const list_tmt = ["PELAKSANA25"];
const dokumen = ["SK"];

const Tombol = ({ tmt, file, nip }) => {
  const { data, isLoading } = useQuery(
    ["check-document-perbaikan", `${tmt}-${file}-${nip}`],
    () => checkDocumentByNip({ tmt, file, nip }),
    {
      refetchOnWindowFocus: false,
    }
  );

  const [loading, setLoading] = useState(false);

  const downloadFile = async () => {
    try {
      setLoading(true);
      const payload = {
        tmt,
        file,
        nip,
      };
      const result = await downloadDocumentByNip(payload);

      if (result) {
        const url = `data:application/pdf;base64,${result}`;
        const link = document.createElement("a");
        link.href = url;
        link.download = `${file}_${tmt}.pdf`;
        link.click();
        message.success("Berhasil mengunduh dokumen");
      }
    } catch (error) {
      message.error("Gagal mengunduh dokumen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={downloadFile}
        disabled={isLoading || !data}
        loading={loading}
        type="primary"
        icon={<CloudDownloadOutlined />}
      >
        Unduh {file}
      </Button>
    </>
  );
};

const Dokumen = ({ tmt, nip }) => {
  return (
    <Space>
      {dokumen?.map((dok) => {
        return <Tombol key={tmt} tmt={tmt} file={dok} nip={nip} />;
      })}
    </Space>
  );
};

function BerkasJabatanPelaksanaBaruByNip() {
  const router = useRouter();
  const { nip } = router.query;

  return (
    <Space direction="vertical" size="large">
      {list_tmt?.map((tmt) => (
        <>
          <Typography.Text strong>SK Jabatan Pelaksana 2025</Typography.Text>
          <Dokumen key={tmt} tmt={tmt} nip={nip} />
        </>
      ))}
    </Space>
  );
}

export default BerkasJabatanPelaksanaBaruByNip;

import { checkDocument, downloadDocument } from "@/services/berkas.services";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Space, Typography } from "antd";
import { useState } from "react";

const list_tmt = ["PELAKSANA25"];
const dokumen = ["SK"];

const Tombol = ({ tmt, file }) => {
  const { data, isLoading } = useQuery(
    ["check-document-perbaikan", `${tmt}-${file}`],
    () => checkDocument({ tmt, file }),
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
      };
      const result = await downloadDocument(payload);

      if (result) {
        const url = `data:application/pdf;base64,${result}`;
        const link = document.createElement("a");
        link.href = url;
        link.download = `${file}_${tmt}.pdf`;
        link.click();
      }
    } catch (error) {
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

const Dokumen = ({ tmt }) => {
  return (
    <Space>
      {dokumen?.map((dok) => {
        return <Tombol key={tmt} tmt={tmt} file={dok} />;
      })}
    </Space>
  );
};

function BerkasJabatanPelaksanaBaru() {
  return (
    <Space direction="vertical" size="large">
      {list_tmt?.map((tmt) => (
        <>
          <Typography.Text strong>SK Jabatan Pelaksana 2025</Typography.Text>
          <Dokumen key={tmt} tmt={tmt} />
        </>
      ))}
    </Space>
  );
}

export default BerkasJabatanPelaksanaBaru;

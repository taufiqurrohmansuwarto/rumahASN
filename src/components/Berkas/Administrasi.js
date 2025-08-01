import { checkDocument, downloadDocument } from "@/services/berkas.services";
import { ExportOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Flex, Space, Typography } from "antd";
import { useState } from "react";

const list_tmt = [
  "01042024",
  "01052024",
  "01062024",
  "01072024",
  "01082024",
  "01012025",
  "01032025",
  "01062025",
  "01072025",
  "01082025",
];

const dokumen = ["SK", "PERTEK", "SPMT", "PK"];

const Tombol = ({ tmt, file }) => {
  const { data, isLoading } = useQuery(
    ["check-document", `${tmt}-${file}`],
    () => checkDocument({ tmt, file }),
    {
      refetchOnWindowFocus: false,
    }
  );

  const [loading, setLoading] = useState(false);

  const downloadFile = async () => {
    try {
      setLoading(true);
      const result = await downloadDocument({
        tmt,
        file,
      });

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
      >
        Download {file}
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

const downloadPk = async () => {
  const link = "https://siasn.bkd.jatimprov.go.id:9000/public/PK_2_7.pdf";
  window.open(link, "_blank");
};

function Administrasi() {
  return (
    <Flex vertical>
      <Flex justify="flex-end">
        <Button
          icon={<ExportOutlined />}
          type="default"
          onClick={downloadPk}
          size="small"
        >
          Download PK Halaman 2 s/d 7
        </Button>
      </Flex>
      <Space direction="vertical" size="large">
        {list_tmt?.map((tmt) => (
          <>
            <Typography.Text strong>
              Download Administrasi PNS/PPPK TMT {tmt}
            </Typography.Text>
            <Dokumen key={tmt} tmt={tmt} />
          </>
        ))}
      </Space>
    </Flex>
  );
}

export default Administrasi;

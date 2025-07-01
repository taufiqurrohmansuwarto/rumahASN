import {
  checkDocumentByNip,
  downloadDocumentByNip,
} from "@/services/master.services";
import { CloudDownloadOutlined, ExportOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Flex, Space, Typography } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

const list_tmt = [
  "01042024",
  "01052024",
  "01062024",
  "01072024",
  "01082024",
  "01012025",
  "01062025",
  "01072025",
];
const dokumen = ["SK", "PERTEK", "SPMT", "PK"];

const Tombol = ({ tmt, file, nip }) => {
  const { data, isLoading } = useQuery(
    ["check-document", `${tmt}-${file}`],
    () => checkDocumentByNip({ tmt, file, nip }),
    {
      refetchOnWindowFocus: false,
    }
  );

  const [loading, setLoading] = useState(false);

  const downloadFile = async () => {
    try {
      setLoading(true);
      const result = await downloadDocumentByNip({
        tmt,
        file,
        nip,
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
        icon={<CloudDownloadOutlined />}
      >
        {file}
      </Button>
    </>
  );
};

const Dokumen = ({ tmt, nip }) => {
  return (
    <Space>
      {dokumen?.map((dok) => {
        return <Tombol key={`${tmt}-${dok}`} tmt={tmt} file={dok} nip={nip} />;
      })}
    </Space>
  );
};

const downloadPk = async () => {
  const link = "https://siasn.bkd.jatimprov.go.id:9000/public/PK_2_7.pdf";
  // open in new tab
  window.open(link, "_blank");
};

function AdministrasiByNip() {
  const router = useRouter();
  const { nip } = router.query;

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
            <Typography.Text strong>PNS/PPPK TMT {tmt}</Typography.Text>
            <Dokumen nip={nip} key={tmt} tmt={tmt} />
          </>
        ))}
      </Space>
    </Flex>
  );
}

export default AdministrasiByNip;

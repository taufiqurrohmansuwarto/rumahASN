import { checkDocument, downloadDocument } from "@/services/berkas.services";
import { useQuery } from "@tanstack/react-query";
import { Button, Space, Typography } from "antd";
import { useState } from "react";

const list_tmt = ["01042024"];
const dokumen = ["SK", "PERTEK"];

const Tombol = ({ tmt, file }) => {
  const { data, isLoading } = useQuery(
    ["check-document", `${tmt}-${file}`],
    () => checkDocument({ tmt, file, employee_type: "PNS" }),
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
        employee_type: "PNS",
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

function BerkasPNS() {
  return (
    <Space direction="vertical">
      {list_tmt?.map((tmt) => (
        <>
          <Typography.Text strong>
            Download Dokumen PNS TMT {tmt}
          </Typography.Text>
          <Dokumen key={tmt} tmt={tmt} />
        </>
      ))}
    </Space>
  );
}

export default BerkasPNS;

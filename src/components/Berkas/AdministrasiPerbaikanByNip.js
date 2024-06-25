import {
  checkDokumenPerbaikanByNip,
  downloadDocumentByNip,
} from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import { Button, Space, Typography } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

const list_tmt = ["2021"];
const dokumen = ["PK"];

const Tombol = ({ tmt, file }) => {
  const { data, isLoading } = useQuery(
    ["check-document", `${tmt}-${file}`],
    () => checkDokumenPerbaikanByNip({ formasi: tmt, file, nip }),
    {
      refetchOnWindowFocus: false,
    }
  );

  const [loading, setLoading] = useState(false);

  const downloadFile = async () => {
    try {
      setLoading(true);
      const result = await downloadDocumentByNip({
        nip,
        formasi: tmt,
        file,
      });

      if (result) {
        const url = `data:application/pdf;base64,${result}`;
        const link = document.createElement("a");
        link.href = url;
        link.download = `PERBAIKAN_${file}_${tmt}.pdf`;
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

function AdministrasiPerbaikanByNip() {
  const router = useRouter();
  const { nip } = router.query;

  return (
    <Space direction="vertical" size="large">
      {list_tmt?.map((tmt) => (
        <>
          <Typography.Text strong>
            Download Perbaikan Dokumen PPPK Gol VII Formasi {tmt}
          </Typography.Text>
          <Dokumen nip={nip} key={tmt} tmt={tmt} />
        </>
      ))}
    </Space>
  );
}

export default AdministrasiPerbaikanByNip;

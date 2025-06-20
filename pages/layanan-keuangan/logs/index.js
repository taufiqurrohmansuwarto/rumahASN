import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import LogLayananKeuangan from "@/components/LayananKeuangan/LogLayananKeuangan";
import { FloatButton } from "antd";
import useScrollRestoration from "@/hooks/useScrollRestoration";

const LayananKeuangan = () => {
  useScrollRestoration();
  return (
    <>
      <Head>
        <title>Layanan Keuangan - Logs</title>
      </Head>
      <PageContainer
        title="Logs Sistem"
        content="Pantau dan kelola semua aktivitas sistem layanan keuangan untuk administrator"
      >
        <FloatButton.BackTop />
        <LogLayananKeuangan />
      </PageContainer>
    </>
  );
};

LayananKeuangan.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/logs">
      {page}
    </LayananKeuanganLayout>
  );
};

LayananKeuangan.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default LayananKeuangan;

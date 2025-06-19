import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import LogLayananKeuangan from "@/components/LayananKeuangan/LogLayananKeuangan";

const LayananKeuangan = () => {
  return (
    <>
      <Head>
        <title>Layanan Keuangan - Logs</title>
      </Head>
      <PageContainer
        title="Logs Sistem"
        content="Pantau dan kelola semua aktivitas sistem layanan keuangan untuk administrator"
      >
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

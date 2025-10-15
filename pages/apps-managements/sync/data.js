import SiasnToken from "@/components/Admin/SiasnToken";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DaftarSinkron from "@/components/Sinkron/DaftarSinkron";
import SinkronLayout from "@/components/Sinkron/SinkronLayout";
import DaftarTombolSinkron from "@/components/Sinkron/DaftarTombolSinkron";

import Head from "next/head";

const Sync = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Apps Management - Sinkronisasi Data</title>
      </Head>
      <PageContainer
        content="Sinkronisasi Data Referensi & Master"
        title="🔄 Sinkronisasi Data"
      >
        <SinkronLayout active="data">
          <SiasnToken />
          <DaftarSinkron />
          <DaftarTombolSinkron />
        </SinkronLayout>
      </PageContainer>
    </>
  );
};

Sync.getLayout = (page) => <Layout>{page}</Layout>;

Sync.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Sync;

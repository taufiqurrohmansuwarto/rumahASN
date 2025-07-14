import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DaftarSinkron from "@/components/Sinkron/DaftarSinkron";
import SinkronJft from "@/components/Sinkron/SinkronJft";
import SinkronJfu from "@/components/Sinkron/SinkronJfu";
import SinkronLayout from "@/components/Sinkron/SinkronLayout";
import SinkronMaster from "@/components/Sinkron/SinkronMaster";
import SinkronSKP from "@/components/Sinkron/SinkronSKP";
import SinkronUnorMaster from "@/components/Sinkron/SinkronUnorMaster";
import SyncUnorSiasn from "@/components/Sinkron/SyncUnorSiasn";
import SiasnToken from "@/components/Admin/SiasnToken";
import SyncPendidikan from "@/components/Sinkron/SyncPendidikan";

import { Space } from "antd";
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
          <div style={{ marginTop: 10 }}>
            <Space>
              <SinkronMaster />
              <SinkronUnorMaster />
              <SyncPendidikan />
              <SinkronJfu />
              <SinkronJft />
              <SinkronSKP />
              <SyncUnorSiasn />
            </Space>
          </div>
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

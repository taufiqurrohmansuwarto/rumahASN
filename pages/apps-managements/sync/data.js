import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DaftarSinkron from "@/components/Sinkron/DaftarSinkron";
import SinkronJft from "@/components/Sinkron/SinkronJft";
import SinkronJfu from "@/components/Sinkron/SinkronJfu";
import SinkronLayout from "@/components/Sinkron/SinkronLayout";
import SinkronMaster from "@/components/Sinkron/SinkronMaster";
import SinkronUnorMaster from "@/components/Sinkron/SinkronUnorMaster";
import { Card, Space } from "antd";
import Head from "next/head";

const Sync = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Apps Management - Sinkronisasi Data</title>
      </Head>
      <PageContainer content="Sinkronisasi Data" title="Sinkron Data">
        <SinkronLayout active="data">
          <Card>
            <DaftarSinkron />
            <div style={{ marginTop: 10 }}>
              <Space>
                <SinkronMaster />
                <SinkronUnorMaster />
                <SinkronJfu />
                <SinkronJft />
              </Space>
            </div>
          </Card>
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

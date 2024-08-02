import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DaftarSinkron from "@/components/Sinkron/DaftarSinkron";
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
            <Space>
              <SinkronMaster />
              <SinkronUnorMaster />
            </Space>
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

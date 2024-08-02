import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import PegawaiMaster from "@/components/Sinkron/PegawaiMaster";
import SinkronLayout from "@/components/Sinkron/SinkronLayout";
import { Card } from "antd";
import Head from "next/head";

const SyncPegawaiMaster = () => {
  return (
    <>
      <Head>
        <title>
          Rumah ASN - Apps Management - Sinkronisasi Data Pegawai Master
        </title>
      </Head>
      <PageContainer content="Sinkronisasi Data" title="Sinkron Data">
        <SinkronLayout active="pegawai-master">
          <Card>
            <PegawaiMaster />
          </Card>
        </SinkronLayout>
      </PageContainer>
    </>
  );
};

SyncPegawaiMaster.getLayout = (page) => (
  <Layout active="/apps-managements/sync/data">{page}</Layout>
);

SyncPegawaiMaster.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default SyncPegawaiMaster;

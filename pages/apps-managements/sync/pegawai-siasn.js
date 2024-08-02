import ReportEmployees from "@/components/LayananSIASN/ReportEmployees";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import SinkronLayout from "@/components/Sinkron/SinkronLayout";
import { Card } from "antd";
import Head from "next/head";

const SyncPegawaiSIASN = () => {
  return (
    <>
      <Head>
        <title>
          Rumah ASN - Apps Management - Sinkronisasi Data Pegawai Master
        </title>
      </Head>
      <PageContainer content="Sinkronisasi Data" title="Sinkron Data">
        <SinkronLayout active="pegawai-siasn">
          <Card>
            <ReportEmployees />
          </Card>
        </SinkronLayout>
      </PageContainer>
    </>
  );
};

SyncPegawaiSIASN.getLayout = (page) => (
  <Layout active="/apps-managements/sync/data">{page}</Layout>
);

SyncPegawaiSIASN.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default SyncPegawaiSIASN;

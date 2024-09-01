import AdminBezzeting from "@/components/Bezzeting/AdminBezzeting";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import SinkronLayout from "@/components/Sinkron/SinkronLayout";
import { Card } from "antd";
import Head from "next/head";

const BezzetingJF = () => {
  return (
    <>
      <Head>
        <title>
          Rumah ASN - Apps Management - Bezzeting Jabatan Fungsional
        </title>
      </Head>
      <PageContainer content="Sinkronisasi Data" title="Sinkron Data">
        <SinkronLayout active="bezzeting-jf">
          <Card title="Bezzeting Jabatan Fungsional">
            <AdminBezzeting />
          </Card>
        </SinkronLayout>
      </PageContainer>
    </>
  );
};

BezzetingJF.getLayout = (page) => (
  <Layout active="/apps-managements/sync/data">{page}</Layout>
);

BezzetingJF.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default BezzetingJF;

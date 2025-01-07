import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import SinkronLayout from "@/components/Sinkron/SinkronLayout";
import { Card } from "antd";
import Head from "next/head";
import RefJft from "@/components/Sinkron/RefJft";

const SyncRefJft = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Apps Management - Ref JFT</title>
      </Head>
      <PageContainer content="Ref JFT" title="Ref JFT">
        <SinkronLayout active="ref-jft">
          <Card>
            <RefJft />
          </Card>
        </SinkronLayout>
      </PageContainer>
    </>
  );
};

SyncRefJft.getLayout = (page) => (
  <Layout active="/apps-managements/sync/data">{page}</Layout>
);

SyncRefJft.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default SyncRefJft;

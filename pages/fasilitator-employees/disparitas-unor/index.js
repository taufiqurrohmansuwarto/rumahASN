import DisparitasUnorSIASN from "@/components/Disparitas/DisparitasUnorSIASN";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Card } from "antd";
import Head from "next/head";

function DisparitasUnorFasilitator() {
  return (
    <>
      <Head>
        <title>Disparitas Unor - Fasilitator</title>
      </Head>
      <PageContainer title="Disparitas Unor">
        <Card>
          <DisparitasUnorSIASN />
        </Card>
      </PageContainer>
    </>
  );
}

DisparitasUnorFasilitator.Auth = {
  action: "manage",
  subject: "Feeds",
};

DisparitasUnorFasilitator.getLayout = function getLayout(page) {
  return (
    <Layout active="/fasilitator-employees/disparitas-unor">{page}</Layout>
  );
};

export default DisparitasUnorFasilitator;

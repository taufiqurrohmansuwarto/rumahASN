import { MyKnowledgeDashboard } from "@/components/KnowledgeManagements";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { FloatButton } from "antd";
import Head from "next/head";

const AsnKnowledgeMyKnowledgeDashboard = () => {
  useScrollRestoration();

  return (
    <>
      <Head>
        <title>Rumah ASN - Pojok Pengetahuan - Pengetahuan Saya</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <FloatButton.BackTop />
        <PageContainer title="Pengetahuan Saya">
          <MyKnowledgeDashboard />
        </PageContainer>
      </LayoutASNConnect>
    </>
  );
};

AsnKnowledgeMyKnowledgeDashboard.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledgeMyKnowledgeDashboard.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnKnowledgeMyKnowledgeDashboard;

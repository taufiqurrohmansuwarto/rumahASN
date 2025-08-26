import { MyKnowledgeContents, KnowledgeNavigationSegmented } from "@/components/KnowledgeManagements";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { FloatButton, Flex } from "antd";
import Head from "next/head";

const AsnKnowledgeMyKnowledge = () => {
  useScrollRestoration();

  return (
    <>
      <Head>
        <title>Rumah ASN - Pojok Pengetahuan - Pengetahuan Saya</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <FloatButton.BackTop />
        <PageContainer 
          title="Pengetahuan Saya"
          extra={
            <KnowledgeNavigationSegmented currentPath="/asn-connect/asn-knowledge/my-knowledge" />
          }
        >
          <MyKnowledgeContents />
        </PageContainer>
      </LayoutASNConnect>
    </>
  );
};

AsnKnowledgeMyKnowledge.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledgeMyKnowledge.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnKnowledgeMyKnowledge;

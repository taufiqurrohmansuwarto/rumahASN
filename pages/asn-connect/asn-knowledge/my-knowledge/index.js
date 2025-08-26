import {
  MyKnowledgeContents,
  KnowledgeLayout,
} from "@/components/KnowledgeManagements";
import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { FloatButton } from "antd";
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
        <KnowledgeLayout currentPath="/asn-connect/asn-knowledge/my-knowledge">
          <MyKnowledgeContents />
        </KnowledgeLayout>
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

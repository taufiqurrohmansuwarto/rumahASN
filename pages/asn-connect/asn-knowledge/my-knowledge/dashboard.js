import {
  MyKnowledgeDashboard,
  KnowledgeLayout,
} from "@/components/KnowledgeManagements";
import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { FloatButton } from "antd";
import Head from "next/head";

const AsnKnowledgeMyKnowledgeDashboard = () => {
  useScrollRestoration("dashboard-scroll", true, false, true); // Enable smooth restoration

  return (
    <>
      <Head>
        <title>Rumah ASN - Pojok Pengetahuan - Pengetahuan Saya</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <FloatButton.BackTop />
        <KnowledgeLayout currentPath="/asn-connect/asn-knowledge/my-knowledge/dashboard">
          <MyKnowledgeDashboard />
        </KnowledgeLayout>
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

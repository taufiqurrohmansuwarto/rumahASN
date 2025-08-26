import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";
import { useRouter } from "next/router";

const AsnKnowledgeMyKnowledge = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Pojok Pengetahuan - Pengetahuan Saya</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <PageContainer title="Pengetahuan Saya" onBack={() => router.back()}>
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

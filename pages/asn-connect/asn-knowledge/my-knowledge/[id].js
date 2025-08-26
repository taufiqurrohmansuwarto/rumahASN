import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";
import { useRouter } from "next/router";

const AsnKnowledgeMyKnowledgeDetail = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Pojok Pengetahuan - Detail Pengetahuan</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <PageContainer
          title="Detail Pengetahuan"
          onBack={() => router.back()}
        ></PageContainer>
      </LayoutASNConnect>
    </>
  );
};

AsnKnowledgeMyKnowledgeDetail.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledgeMyKnowledgeDetail.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnKnowledgeMyKnowledgeDetail;

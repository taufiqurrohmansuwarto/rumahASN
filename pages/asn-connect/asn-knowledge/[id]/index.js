import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";
import KnowledgeUserContentDetail from "@/components/KnowledgeManagements/KnowledgeUserContentDetail";
import PageContainer from "@/components/PageContainer";
import { useRouter } from "next/router";

const AsnKnowledgeDetail = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Pengetahuan</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <PageContainer onBack={() => router.back()}>
          <KnowledgeUserContentDetail />
        </PageContainer>
      </LayoutASNConnect>
    </>
  );
};

AsnKnowledgeDetail.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledgeDetail.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-knowledge">{page}</Layout>;
};

export default AsnKnowledgeDetail;

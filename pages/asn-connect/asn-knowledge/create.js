import { KnowledgeFormUserContents } from "@/components/KnowledgeManagements";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";
import { useRouter } from "next/router";

const AsnKnowledgeCreate = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Buat Pengetahuan</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <PageContainer title="Buat Pengetahuan" onBack={() => router.back()}>
          <KnowledgeFormUserContents />
        </PageContainer>
      </LayoutASNConnect>
    </>
  );
};

AsnKnowledgeCreate.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledgeCreate.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-knowledge">{page}</Layout>;
};

export default AsnKnowledgeCreate;

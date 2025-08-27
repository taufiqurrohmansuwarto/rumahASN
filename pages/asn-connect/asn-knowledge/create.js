import { KnowledgeFormUserContents } from "@/components/KnowledgeManagements";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";
import { useRouter } from "next/router";

const AsnKnowledgeCreate = () => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/asn-connect/asn-knowledge/my-knowledge");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Pojok Pengetahuan - Buat Pengetahuan</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <PageContainer title="Buat Pengetahuan" onBack={() => router.back()}>
          <KnowledgeFormUserContents onSuccess={handleSuccess} />
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
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnKnowledgeCreate;

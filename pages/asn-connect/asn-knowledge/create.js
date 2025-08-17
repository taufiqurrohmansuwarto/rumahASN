import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";
import KnowledgeFormUserContents from "@/components/KnowledgeManagements/KnowledgeFormUserContents";
import { useRouter } from "next/router";

const AsnKnowledgeCreate = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Buat Pengetahuan</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <KnowledgeFormUserContents
          onSuccess={() => {
            router.push("/asn-connect/asn-knowledge");
          }}
        />
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

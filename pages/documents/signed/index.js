import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const SignedDocuments = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Semua Dokumen</title>
      </Head>
      <PageContainer>
        <div>index</div>
      </PageContainer>
    </>
  );
};

SignedDocuments.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

SignedDocuments.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default SignedDocuments;

import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const WaitingDocuments = () => {
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

WaitingDocuments.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

WaitingDocuments.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default WaitingDocuments;

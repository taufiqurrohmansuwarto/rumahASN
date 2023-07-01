import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const RejectedDocuments = () => {
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

RejectedDocuments.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

RejectedDocuments.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default RejectedDocuments;

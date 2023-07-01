import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const Documents = () => {
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

Documents.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

Documents.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Documents;

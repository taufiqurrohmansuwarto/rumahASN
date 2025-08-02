import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import UploadVerbatim from "@/components/AITools/VerbatimAI/UploadVerbatim";
import DaftarVerbatim from "@/components/AITools/VerbatimAI/DaftarVerbatim";
import Head from "next/head";

function Dashboard() {
  return (
    <>
      <Head>
        <title>Rumah ASN - AI Tools</title>
      </Head>
      <PageContainer title="AI Tools" subTitle="Tools AI untuk Rumah ASN">
        <UploadVerbatim />
        <DaftarVerbatim />
      </PageContainer>
    </>
  );
}

Dashboard.getLayout = function getLayout(page) {
  return <Layout active="/ai-tools/dashboard">{page}</Layout>;
};

Dashboard.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default Dashboard;

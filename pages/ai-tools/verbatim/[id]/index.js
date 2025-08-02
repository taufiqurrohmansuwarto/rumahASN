import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import DetailVerbatim from "@/components/AITools/VerbatimAI/DetailVerbatim";

function DetailVerbatimPage() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Verbatim</title>
      </Head>
      <PageContainer title="Detail Verbatim" subTitle="Detail Verbatim">
        <DetailVerbatim />
      </PageContainer>
    </>
  );
}

DetailVerbatimPage.getLayout = function getLayout(page) {
  return <Layout active="/ai-tools/verbatim">{page}</Layout>;
};

DetailVerbatimPage.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default DetailVerbatimPage;

import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import DetailVerbatim from "@/components/AITools/VerbatimAI/DetailVerbatim";
import { useRouter } from "next/router";

function DetailVerbatimPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Verbatim</title>
      </Head>
      <PageContainer
        title="Detail Verbatim"
        subTitle="Detail Verbatim"
        onBack={handleBack}
      >
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

import InformationLayout from "@/components/Information/InformationLayout";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Tutorials from "@/components/PusatBantuan/Tutorials";
import Head from "next/head";

const Tutorial = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Informasi - Tutorial</title>
      </Head>
      <PageContainer
        title="Informasi Rumah ASN"
        content="Tutorial yang tersedia di Rumah ASN"
      >
        <InformationLayout
          active="tutorials"
          title="Informasi Rumah ASN"
          content="Tutorial yang tersedia di Rumah ASN"
        >
          <Tutorials />
        </InformationLayout>
      </PageContainer>
    </>
  );
};

Tutorial.Auth = {
  action: "manage",
  subject: "Feeds",
};

Tutorial.getLayout = function getLayout(page) {
  return <Layout active="/information/faq">{page}</Layout>;
};

export default Tutorial;

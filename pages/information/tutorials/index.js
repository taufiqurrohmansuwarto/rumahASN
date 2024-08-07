import InformationLayout from "@/components/Information/InformationLayout";
import Layout from "@/components/Layout";
import Tutorials from "@/components/PusatBantuan/Tutorials";
import Head from "next/head";

function Tutorial() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Informasi - Tutorial</title>
      </Head>
      <InformationLayout
        active="tutorials"
        title="Informasi Rumah ASN"
        content="Tutorial yang tersedia di Rumah ASN"
      >
        <Tutorials />
      </InformationLayout>
    </>
  );
}

Tutorial.Auth = {
  action: "manage",
  subject: "Feeds",
};

Tutorial.getLayout = function getLayout(page) {
  return <Layout active="/information/faq">{page}</Layout>;
};

export default Tutorial;

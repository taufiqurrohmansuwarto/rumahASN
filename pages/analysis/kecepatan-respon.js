import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

function KecepatanResponse() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Kecepatan Respon</title>
      </Head>
      <PageContainer
        title="Analisis"
        subTitle="Kecepatan Respon"
      ></PageContainer>
    </>
  );
}

KecepatanResponse.getLayout = function getLayout(page) {
  return <Layout active="/analysis/kecepatan-respon">{page}</Layout>;
};

KecepatanResponse.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default KecepatanResponse;

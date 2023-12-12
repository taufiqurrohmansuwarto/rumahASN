import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

function Trend() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Trend</title>
      </Head>
      <PageContainer title="Analisis" subTitle="Trend Pertanyaan">
        {/* <PlotTrendQuestion /> */}
      </PageContainer>
    </>
  );
}

Trend.getLayout = function getLayout(page) {
  return <Layout active="/analysis/trend">{page}</Layout>;
};

Trend.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default Trend;

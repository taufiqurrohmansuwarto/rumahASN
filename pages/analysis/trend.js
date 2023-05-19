import Layout from "@/components/Layout";
import Head from "next/head";

function Trend() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Trend</title>
      </Head>
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

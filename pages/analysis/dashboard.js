import Layout from "@/components/Layout";
import Head from "next/head";

function DashboardAnalysis() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Dashboard</title>
      </Head>
    </>
  );
}

DashboardAnalysis.getLayout = function getLayout(page) {
  return <Layout active="/analysis/dashboard">{page}</Layout>;
};

DashboardAnalysis.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default DashboardAnalysis;

import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

function DashboardAnalysis() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Dashboard</title>
      </Head>
      <PageContainer title="Dashboard" subTitle="Analisis Data Rumah ASN">
        {/* <DataTickets /> */}
        {/* <PlotAdminTickets /> */}
      </PageContainer>
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

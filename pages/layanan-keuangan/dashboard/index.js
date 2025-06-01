import LayananKeuanganLandingPage from "@/components/LayananKeuangan/LayananKeuanganLandingPage";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

const Dashboard = () => {
  return (
    <>
      <Head>
        <title>Layanan Keuangan</title>
      </Head>
      <PageContainer>
        <LayananKeuanganLandingPage />
      </PageContainer>
    </>
  );
};

Dashboard.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/dashboard">
      {page}
    </LayananKeuanganLayout>
  );
};

Dashboard.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default Dashboard;

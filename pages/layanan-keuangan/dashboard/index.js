import LayananKeuanganLandingPage from "@/components/LayananKeuangan/LayananKeuanganLandingPage";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { Grid } from "antd";

const Dashboard = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Layanan Keuangan</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? null : 0,
        }}
      >
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

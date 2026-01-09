import PageContainer from "@/components/PageContainer";
import RekonDashboardDetail from "@/components/Rekon/RekonDashboardDetail";
import RekonLayout from "@/components/Rekon/RekonLayout";
import LaporanProgress from "@/components/Rekon/LaporanProgress";
import { Stack } from "@mantine/core";
import { Breadcrumb } from "antd";
import Head from "next/head";

const RekonDashboard = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekonisiliasi - Dashboard</title>
      </Head>
      <PageContainer
        title="Dashboard Rekonisiliasi"
        content="Monitoring dan rekonisiliasi data layanan SIASN"
        subTitle="Kelola dan pantau integrasi data kepegawaian dengan sistem SIASN"
        breadcrumbRender={() => {
          return (
            <>
              <Breadcrumb>
                <Breadcrumb.Item>Rekonisiliasi</Breadcrumb.Item>
                <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
              </Breadcrumb>
            </>
          );
        }}
      >
        <Stack>
          <LaporanProgress />
          <RekonDashboardDetail />
        </Stack>
      </PageContainer>
    </>
  );
};

RekonDashboard.getLayout = (page) => {
  return <RekonLayout active="/rekon/dashboard">{page}</RekonLayout>;
};

RekonDashboard.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonDashboard;

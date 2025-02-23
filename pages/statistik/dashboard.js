import PageContainer from "@/components/PageContainer";
import RASNDashboard from "@/components/Statistik/RASNDashboard";
import StatistikLayout from "@/components/Statistik/StatistikLayout";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";

function StatistikDashboard() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Statistik Dashboard</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Statistik"
        content="Rumah ASN"
      >
        <RASNDashboard />
      </PageContainer>
    </>
  );
}

StatistikDashboard.getLayout = function getLayout(page) {
  return (
    <StatistikLayout active="/statistik/dashboard">{page}</StatistikLayout>
  );
};

StatistikDashboard.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default StatistikDashboard;

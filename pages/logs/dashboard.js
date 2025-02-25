import LogDashboard from "@/components/Log/LogDashboard";
import PageContainer from "@/components/PageContainer";
import LogLayout from "@/components/Log/LogLayout";
import { Grid, Breadcrumb } from "antd";
import Head from "next/head";

function DashboardLogs() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>History Log User</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="History Log User"
        subTitle="History Log User"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <LogDashboard />
      </PageContainer>
    </>
  );
}

DashboardLogs.getLayout = function getLayout(page) {
  return <LogLayout active="/logs/dashboard">{page}</LogLayout>;
};

DashboardLogs.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default DashboardLogs;

import LogDashboard from "@/components/Log/LogDashboard";
import PageContainer from "@/components/PageContainer";
import LogLayout from "@/components/Log/LogLayout";
import { Grid } from "antd";
import Head from "next/head";

function DashboardLogs() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Logs</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="Logs"
        subTitle="Log Rumah ASN"
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

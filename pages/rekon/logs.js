import DashboardLogSiasn from "@/components/Log/DashboardLogSiasn";
import LogHistorySIASN from "@/components/Log/LogHistorySIASN";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";

const Logs = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Logs</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/rekon/dashboard">Dashboard</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Riwayat Log</Breadcrumb.Item>
          </Breadcrumb>
        )}
        title="Rekon"
        content="Riwayat Log"
      >
        <DashboardLogSiasn />
        <LogHistorySIASN />
      </PageContainer>
    </>
  );
};

Logs.getLayout = (page) => {
  return <RekonLayout active="/rekon/logs">{page}</RekonLayout>;
};

Logs.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Logs;

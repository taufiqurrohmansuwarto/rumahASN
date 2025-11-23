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
        <title>Rumah ASN - Rekonisiliasi - Riwayat Log</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/rekon/dashboard">Rekonisiliasi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/rekon/dashboard">Dashboard</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Riwayat Log</Breadcrumb.Item>
          </Breadcrumb>
        )}
        title="Riwayat Log Rekonisiliasi"
        content="Pantau aktivitas dan log sinkronisasi data SIASN"
        subTitle="Lihat detail log integrasi dan history sinkronisasi data kepegawaian"
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

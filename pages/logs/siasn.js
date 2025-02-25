import LogHistorySIASN from "@/components/Log/LogHistorySIASN";
import LogLayout from "@/components/Log/LogLayout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, FloatButton, Grid } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import Head from "next/head";
import Link from "next/link";
dayjs.locale("id");
dayjs.extend(relativeTime);

function LogSIASN() {
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Log SIASN</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Log"
        subTitle="Layanan SIASN"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/integrasi/siasn">
                  Integrasi SIASN
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Log</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <FloatButton.BackTop />
        <LogHistorySIASN />
      </PageContainer>
    </>
  );
}

LogSIASN.getLayout = function getLayout(page) {
  return <LogLayout active="/logs/siasn">{page}</LogLayout>;
};

LogSIASN.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LogSIASN;

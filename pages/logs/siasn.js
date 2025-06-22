import LogLayout from "@/components/Log/LogLayout";
import LogSiasn from "@/components/Log/LogSiasn";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, FloatButton, Grid } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import Head from "next/head";
import Link from "next/link";
dayjs.locale("id");
dayjs.extend(relativeTime);

const LogSiasnPage = () => {
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
        title={null}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/logs/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>History User SIASN</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <FloatButton.BackTop />
        <LogSiasn />
      </PageContainer>
    </>
  );
};

LogSiasnPage.getLayout = function getLayout(page) {
  return <LogLayout active="/logs/siasn">{page}</LogLayout>;
};

LogSiasnPage.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LogSiasnPage;

import LogLayout from "@/components/Log/LogLayout";
import LogUser from "@/components/Log/LogUser";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, FloatButton, Grid } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import Head from "next/head";
import Link from "next/link";
dayjs.locale("id");
dayjs.extend(relativeTime);

const LogUserPage = () => {
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Riwayat User</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/logs/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>History User</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <FloatButton.BackTop />
        <LogUser />
      </PageContainer>
    </>
  );
};

LogUserPage.getLayout = function getLayout(page) {
  return <LogLayout active="/logs/user">{page}</LogLayout>;
};

LogUserPage.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LogUserPage;

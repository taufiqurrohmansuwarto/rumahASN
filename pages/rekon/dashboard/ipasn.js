import PageContainer from "@/components/PageContainer";
import RekonIPASNDetail from "@/components/Rekon/RekonIPASNDetail";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";

const RekonIPASN = () => {
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Dashboard</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Dashboard"
        content="Dashboard Rekon"
        breadcrumbRender={() => {
          return (
            <>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Link href="/rekon/dashboard">Dashboard</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Dashboard IPASN</Breadcrumb.Item>
              </Breadcrumb>
            </>
          );
        }}
      >
        <RekonIPASNDetail />
      </PageContainer>
    </>
  );
};

RekonIPASN.getLayout = (page) => {
  return <RekonLayout active="/rekon/dashboard">{page}</RekonLayout>;
};

RekonIPASN.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonIPASN;

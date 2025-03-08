import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import RekonLayananPensiunDetail from "@/components/Rekon/RekonLayananPensiunDetail";

const RekonPemberhentian = () => {
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
        title="Layanan Pemberhentian"
        content="Layanan Pemberhentian"
        breadcrumbRender={() => {
          return (
            <>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Link href="/rekon/dashboard">Dashboard</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Layanan Pemberhentian</Breadcrumb.Item>
              </Breadcrumb>
            </>
          );
        }}
      >
        <RekonLayananPensiunDetail />
      </PageContainer>
    </>
  );
};

RekonPemberhentian.getLayout = (page) => {
  return <RekonLayout active="/rekon/dashboard">{page}</RekonLayout>;
};

RekonPemberhentian.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonPemberhentian;

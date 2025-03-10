import PageContainer from "@/components/PageContainer";
import RekonIPASNDetail from "@/components/Rekon/RekonIPASNDetail";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RekonIPASN = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  const handleBack = () => {
    router.push("/rekon/dashboard");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Dashboard</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={handleBack}
        title="Dashboard IPASN"
        content="Dashboard IPASN"
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

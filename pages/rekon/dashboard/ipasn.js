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
        <title>Rumah ASN - Rekonisiliasi - Indeks Profesionalitas ASN</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={handleBack}
        title="Indeks Profesionalitas ASN"
        content="Monitoring dan rekonisiliasi data IPASN"
        subTitle="Pantau indeks profesionalitas dan kompetensi ASN dengan sistem SIASN"
        breadcrumbRender={() => {
          return (
            <>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Link href="/rekon/dashboard">Rekonisiliasi</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <Link href="/rekon/dashboard">Dashboard</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Indeks Profesionalitas ASN</Breadcrumb.Item>
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

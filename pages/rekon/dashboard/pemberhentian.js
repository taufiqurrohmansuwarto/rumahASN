import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import RekonLayananPensiunDetail from "@/components/Rekon/RekonLayananPensiunDetail";
import { useRouter } from "next/router";
const RekonPemberhentian = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  const handleBack = () => {
    router.push("/rekon/dashboard");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekonisiliasi - Layanan Pemberhentian</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={handleBack}
        title="Layanan Pemberhentian"
        content="Monitoring dan rekonisiliasi data pemberhentian pegawai"
        subTitle="Kelola data pensiun dan pemberhentian pegawai dengan sistem SIASN"
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

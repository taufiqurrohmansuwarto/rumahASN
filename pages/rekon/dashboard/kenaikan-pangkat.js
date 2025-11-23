import PageContainer from "@/components/PageContainer";
import RekonLayananPangkatDetail from "@/components/Rekon/RekonLayananPangkatDetail";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RekonKenaikanPangkat = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  const handleBack = () => {
    router.push("/rekon/dashboard");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekonisiliasi - Layanan Kenaikan Pangkat</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={handleBack}
        title="Layanan Kenaikan Pangkat"
        content="Monitoring dan rekonisiliasi data kenaikan pangkat pegawai"
        subTitle="Kelola dan pantau proses kenaikan pangkat dengan sistem SIASN"
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
                <Breadcrumb.Item>Layanan Kenaikan Pangkat</Breadcrumb.Item>
              </Breadcrumb>
            </>
          );
        }}
      >
        <RekonLayananPangkatDetail />
      </PageContainer>
    </>
  );
};

RekonKenaikanPangkat.getLayout = (page) => {
  return <RekonLayout active="/rekon/dashboard">{page}</RekonLayout>;
};

RekonKenaikanPangkat.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonKenaikanPangkat;

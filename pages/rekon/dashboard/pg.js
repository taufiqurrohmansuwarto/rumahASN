import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonPGDetail from "@/components/Rekon/RekonPGDetail";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RekonPG = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  const handleBack = () => {
    router.push("/rekon/dashboard");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekonisiliasi - Pencantuman Gelar</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        onBack={handleBack}
        title="Pencantuman Gelar"
        content="Monitoring dan rekonisiliasi data pencantuman gelar"
        subTitle="Kelola data pencantuman gelar akademik dan profesi pegawai"
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
                <Breadcrumb.Item>Pencantuman Gelar</Breadcrumb.Item>
              </Breadcrumb>
            </>
          );
        }}
      >
        <RekonPGDetail />
      </PageContainer>
    </>
  );
};

RekonPG.getLayout = (page) => {
  return <RekonLayout active="/rekon/dashboard">{page}</RekonLayout>;
};

RekonPG.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonPG;

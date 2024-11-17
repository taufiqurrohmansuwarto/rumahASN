import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareDataDiklat from "@/components/PemutakhiranData/CompareDataDiklat";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Card, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatDiklat = () => {
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data Diklat</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        extra={[<CustomSelectMenu key="menu" />]}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/pemutakhiran-data/komparasi">Peremajaan Data</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Data Riwayat Diklat</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat Diklat"
        content="Komparasi Data Diklat SIASN dan SIMASTER"
      >
        <CompareDataDiklat />
      </PageContainer>
    </>
  );
};

RiwayatDiklat.Auth = {
  action: "manage",
  subject: "Tickets",
};

RiwayatDiklat.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default RiwayatDiklat;

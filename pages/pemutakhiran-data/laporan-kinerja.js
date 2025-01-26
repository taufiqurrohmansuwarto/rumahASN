import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareSKP22 from "@/components/PemutakhiranData/CompareSKP22";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Card, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatLaporanKinerja = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data Laporan Kinerja</title>
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
                <Link href="/pemutakhiran-data/komparasi">Integrasi MyASN</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Data Laporan Kinerja</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat Laporan Kinerja"
        content="Komparasi Data Riwayat Laporan Kinerja SIASN dan SIMASTER"
      >
        <Card>
          <CompareSKP22 />
        </Card>
      </PageContainer>
    </>
  );
};

RiwayatLaporanKinerja.Auth = {
  action: "manage",
  subject: "Tickets",
};

RiwayatLaporanKinerja.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default RiwayatLaporanKinerja;

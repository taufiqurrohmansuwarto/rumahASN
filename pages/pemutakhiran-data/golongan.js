import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareDataGolongan from "@/components/PemutakhiranData/CompareDataGolongan";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Card, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatGolongan = () => {
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data Golongan/Pangkat</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
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
              <Breadcrumb.Item>Data Golongan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat Golongan"
        content="Komparasi Data Golongan SIASN dan SIMASTER"
      >
        <Card>
          <CompareDataGolongan />
        </Card>
      </PageContainer>
    </>
  );
};

RiwayatGolongan.Auth = {
  action: "manage",
  subject: "Tickets",
};

RiwayatGolongan.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default RiwayatGolongan;

import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareDataMasaKerja from "@/components/PemutakhiranData/CompareDataMasaKerja";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatPMK = () => {
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data PMK</title>
      </Head>
      <PageContainer
        extra={[<CustomSelectMenu key="menu" />]}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/pemutakhiran-data/komparasi">
                  <a>Peremajaan Data</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Data Peninjauan Masa Kerja</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat Peninjauan Masa Kerja"
        content="Komparasi Data Peninjauan Masa Kerja SIASN dan SIMASTER"
      >
        <Card>
          <CompareDataMasaKerja />
        </Card>
      </PageContainer>
    </>
  );
};

RiwayatPMK.Auth = {
  action: "manage",
  subject: "Tickets",
};

RiwayatPMK.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default RiwayatPMK;

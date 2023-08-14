import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareAngkaKredit from "@/components/PemutakhiranData/CompareAngkaKredit";
import CompareSKP22 from "@/components/PemutakhiranData/CompareSKP22";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatLaporanKinerja = () => {
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data Laporan Kinerja</title>
      </Head>
      <PageContainer
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
  return <Layout active="/pemutakhiran-data/data-utama">{page}</Layout>;
};

export default RiwayatLaporanKinerja;

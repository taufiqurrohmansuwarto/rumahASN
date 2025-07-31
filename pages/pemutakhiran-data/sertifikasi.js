import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareSertifikasi from "@/components/PemutakhiranData/CompareSertifikasi";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatSertifikasi = () => {
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data Sertifikasi</title>
      </Head>
      <PageContainer
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
              <Breadcrumb.Item>Data Riwayat Sertifikasi</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat Sertifikasi"
        content="Riwayat Sertifikasi Pegawai"
      >
        <Card>
          <CompareSertifikasi />
        </Card>
      </PageContainer>
    </>
  );
};

RiwayatSertifikasi.Auth = {
  action: "manage",
  subject: "Tickets",
};

RiwayatSertifikasi.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default RiwayatSertifikasi;

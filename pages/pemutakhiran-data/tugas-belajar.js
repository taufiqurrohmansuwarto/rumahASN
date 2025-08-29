import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareTugasBelajar from "@/components/PemutakhiranData/CompareTugasBelajar";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatTugasBelajar = () => {
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data Tugas Belajar</title>
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
              <Breadcrumb.Item>Data Riwayat Tugas Belajar</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat Tugas Belajar"
        content="Riwayat Tugas Belajar Pegawai"
      >
        <Card>
          <CompareTugasBelajar />
        </Card>
      </PageContainer>
    </>
  );
};

RiwayatTugasBelajar.Auth = {
  action: "manage",
  subject: "Tickets",
};

RiwayatTugasBelajar.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default RiwayatTugasBelajar;

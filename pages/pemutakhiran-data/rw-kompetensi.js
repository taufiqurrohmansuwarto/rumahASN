import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareRwKompetensi from "@/components/PemutakhiranData/CompareRwKompetensi";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatKompetensi = () => {
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data Kompetensi</title>
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
              <Breadcrumb.Item>Data Riwayat Kompetensi</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat Kompetensi"
        content="Riwayat Kompetensi Pegawai"
      >
        <Card>
          <CompareRwKompetensi />
        </Card>
      </PageContainer>
    </>
  );
};

RiwayatKompetensi.Auth = {
  action: "manage",
  subject: "Tickets",
};

RiwayatKompetensi.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default RiwayatKompetensi;

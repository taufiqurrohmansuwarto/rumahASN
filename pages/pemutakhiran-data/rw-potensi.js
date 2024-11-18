import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareRwPotensi from "@/components/PemutakhiranData/CompareRwPotensi";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatPotensi = () => {
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
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/pemutakhiran-data/komparasi">Peremajaan Data</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Data Riwayat Potensi</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat Potensi"
        content="Riwayat Potensi Pegawai"
      >
        <Card>
          <CompareRwPotensi />
        </Card>
      </PageContainer>
    </>
  );
};

RiwayatPotensi.Auth = {
  action: "manage",
  subject: "Tickets",
};

RiwayatPotensi.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default RiwayatPotensi;

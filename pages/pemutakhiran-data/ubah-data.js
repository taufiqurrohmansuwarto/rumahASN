import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareDataUtama from "@/components/PemutakhiranData/CompareDataUtama";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import RiwayatUbahData from "@/components/PemutakhiranData/RiwayatUbahData";
import { Breadcrumb, Button, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const DataUtama = () => {
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Riwayat Ubah Data</title>
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
              <Breadcrumb.Item>Riwayat Ubah Data</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat Ubah Data"
        content="Riwayat Budah Data Utama"
      >
        <RiwayatUbahData />
      </PageContainer>
    </>
  );
};

DataUtama.Auth = {
  action: "manage",
  subject: "Tickets",
};

DataUtama.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/data-utama">{page}</Layout>;
};

export default DataUtama;

import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareDataUtama from "@/components/PemutakhiranData/CompareDataUtama";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const DataUtama = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data Utama</title>
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
              <Breadcrumb.Item>Data Utama</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Data Utama"
        content="Komparasi Data Utama SIASN dan SIMASTER"
      >
        <CompareDataUtama />
      </PageContainer>
    </>
  );
};

DataUtama.Auth = {
  action: "manage",
  subject: "Tickets",
};

DataUtama.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default DataUtama;

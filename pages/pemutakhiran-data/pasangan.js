import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import CompareDataPasangan from "@/components/PemutakhiranData/CompareDataPasangan";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const Pasangan = () => {
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data Pasangan</title>
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
              <Breadcrumb.Item>Data Pasangan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Data Pasangan"
        content="Komparasi Data Pasangan SIASN dan SIMASTER"
      >
        <CompareDataPasangan />
      </PageContainer>
    </>
  );
};

Pasangan.Auth = {
  action: "manage",
  subject: "Tickets",
};

Pasangan.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default Pasangan;

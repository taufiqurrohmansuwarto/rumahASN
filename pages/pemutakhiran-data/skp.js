import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareSKP from "@/components/PemutakhiranData/CompareSKP";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatSKP = () => {
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data SKP</title>
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
              <Breadcrumb.Item>Data Riwayat SKP</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat SKP"
        content="Komparasi Data SKP SIASN dan SIMASTER"
      >
        <Card>
          <CompareSKP />
        </Card>
      </PageContainer>
    </>
  );
};

RiwayatSKP.Auth = {
  action: "manage",
  subject: "Tickets",
};

RiwayatSKP.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/data-utama">{page}</Layout>;
};

export default RiwayatSKP;

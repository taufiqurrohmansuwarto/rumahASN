import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareDataCltn from "@/components/PemutakhiranData/CompareDataCltn";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatCLTN = () => {
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data CLTN</title>
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
              <Breadcrumb.Item>Data Riwayat CLTN</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat CLTN"
        content="Komparasi Data CLTN SIASN dan SIMASTER"
      >
        <Card>
          <CompareDataCltn />
        </Card>
      </PageContainer>
    </>
  );
};

RiwayatCLTN.Auth = {
  action: "manage",
  subject: "Tickets",
};

RiwayatCLTN.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default RiwayatCLTN;

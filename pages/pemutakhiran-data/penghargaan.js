import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareDataPenghargaan from "@/components/PemutakhiranData/CompareDataPenghargaan";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatPenghargaan = () => {
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data Penghargaan</title>
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
              <Breadcrumb.Item>Data Riwayat Penghargaan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat Penghargaan"
        content="Komparasi Data Penghargaan SIASN dan SIMASTER"
      >
        <Card>
          <CompareDataPenghargaan />
        </Card>
      </PageContainer>
    </>
  );
};

RiwayatPenghargaan.Auth = {
  action: "manage",
  subject: "Tickets",
};

RiwayatPenghargaan.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default RiwayatPenghargaan;

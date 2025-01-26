import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import PencantumanGelar from "@/components/PemutakhiranData/Admin/PencantumanGelar";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatPencantumanGelar = () => {
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data Pencantuman Gelar</title>
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
              <Breadcrumb.Item>Data Riwayat Pencantuman Gelar</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat Pencantuman Gelar"
        content="Komparasi Data Pencantuman Gelar SIASN dan SIMASTER"
      >
        <Card>
          <PencantumanGelar />
        </Card>
      </PageContainer>
    </>
  );
};

RiwayatPencantumanGelar.Auth = {
  action: "manage",
  subject: "Tickets",
};

RiwayatPencantumanGelar.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default RiwayatPencantumanGelar;

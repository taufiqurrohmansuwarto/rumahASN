import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatHukumanDisiplin = () => {
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data Hukuman Disiplin</title>
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
              <Breadcrumb.Item>Data Riwayat Hukuman Disiplin</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat Hukuman Disiplin"
        content="Komparasi Data Hukuman Disiplin SIASN dan SIMASTER"
      >
        <Card>
          <div>Under construction baby..</div>
        </Card>
      </PageContainer>
    </>
  );
};

RiwayatHukumanDisiplin.Auth = {
  action: "manage",
  subject: "Tickets",
};

RiwayatHukumanDisiplin.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default RiwayatHukumanDisiplin;

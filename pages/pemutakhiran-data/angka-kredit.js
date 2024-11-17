import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareAngkaKredit from "@/components/PemutakhiranData/CompareAngkaKredit";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Card, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatAngkaKredit = () => {
  const breakPoint = Grid.useBreakpoint();
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data Angka Kredit</title>
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
                <Link href="/pemutakhiran-data/komparasi">Peremajaan Data</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Data Riwayat Angka Kredit</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat Angka Kredit"
        content="Komparasi Data Angka Kredit SIASN dan SIMASTER"
      >
        <Card>
          <CompareAngkaKredit />
        </Card>
      </PageContainer>
    </>
  );
};

RiwayatAngkaKredit.Auth = {
  action: "manage",
  subject: "Tickets",
};

RiwayatAngkaKredit.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default RiwayatAngkaKredit;

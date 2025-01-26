import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import RiwayatUbahData from "@/components/PemutakhiranData/RiwayatUbahData";
import { Alert, Stack } from "@mantine/core";
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
        <title>Rumah ASN - Peremajaan SIASN - Riwayat Ubah Data</title>
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
              <Breadcrumb.Item>Riwayat Ubah Data</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat Ubah Data"
        content="Ubah Data Utama"
      >
        <Stack>
          <Alert color="yellow" title="Perlu diperhatikan">
            Email yang telah diubah membutuhkan waktu 2x24 jam untuk
            sinkronisasi data
          </Alert>
          <RiwayatUbahData />
        </Stack>
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

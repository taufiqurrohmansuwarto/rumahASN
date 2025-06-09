import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import RiwayatUsulanLayout from "@/components/RiwayatUsulan/RiwayatUsulanLayout";
import RwUsulanPMK from "@/components/RiwayatUsulan/RwUsulanPMK";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const MasaKerja = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data SKP</title>
      </Head>
      <PageContainer
        onBack={() => router.push("/pemutakhiran-data/komparasi")}
        title="Usulan SIASN"
        subTitle="Usulan Masa Kerja"
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
      >
        <RiwayatUsulanLayout
          title="Usulan SIASN"
          content="Riwayat Usulan SIASN Masa Kerja"
          active="masa-kerja"
          breadcrumbTitle="Usulan Masa Kerja"
        >
          <RwUsulanPMK />
        </RiwayatUsulanLayout>
      </PageContainer>
    </>
  );
};

MasaKerja.Auth = {
  action: "manage",
  subject: "Tickets",
};

MasaKerja.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default MasaKerja;

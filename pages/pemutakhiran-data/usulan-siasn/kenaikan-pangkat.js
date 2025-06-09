import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import RiwayatUsulanLayout from "@/components/RiwayatUsulan/RiwayatUsulanLayout";
import RwUsulanKenaikanPangkat from "@/components/RiwayatUsulan/RwUsulanKenaikanPangkat";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const KenaikanPangkat = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data SKP</title>
      </Head>
      <PageContainer
        onBack={() => router.push("/pemutakhiran-data/komparasi")}
        title="Usulan SIASN"
        subTitle="Usulan Kenaikan Pangkat"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/pemutakhiran-data/komparasi">Integrasi MyASN</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Usulan Kenaikan Pangkat</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <RiwayatUsulanLayout
          title="Usulan SIASN"
          content="Riwayat Usulan SIASN Kenaikan Pangkat"
          active="kenaikan-pangkat"
          breadcrumbTitle="Usulan Kenaikan Pangkat"
        >
          <RwUsulanKenaikanPangkat />
        </RiwayatUsulanLayout>
      </PageContainer>
    </>
  );
};

KenaikanPangkat.Auth = {
  action: "manage",
  subject: "Tickets",
};

KenaikanPangkat.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default KenaikanPangkat;

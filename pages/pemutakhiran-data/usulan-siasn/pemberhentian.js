import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import RiwayatUsulanLayout from "@/components/RiwayatUsulan/RiwayatUsulanLayout";
import RwUsulanPemberhentian from "@/components/RiwayatUsulan/RwUsulanPemberhentian";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const Pemberhentian = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data SKP</title>
      </Head>
      <PageContainer
        onBack={() => router.push("/pemutakhiran-data/komparasi")}
        title="Usulan SIASN"
        subTitle="Usulan Pemberhentian"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/pemutakhiran-data/komparasi">Integrasi MyASN</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Usulan Pemberhentian</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <RiwayatUsulanLayout
          title="Usulan SIASN"
          content="Riwayat Usulan SIASN Pemberhentian"
          active="pemberhentian"
          breadcrumbTitle="Usulan Pemberhentian"
        >
          <RwUsulanPemberhentian />
        </RiwayatUsulanLayout>
      </PageContainer>
    </>
  );
};

Pemberhentian.Auth = {
  action: "manage",
  subject: "Tickets",
};

Pemberhentian.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default Pemberhentian;

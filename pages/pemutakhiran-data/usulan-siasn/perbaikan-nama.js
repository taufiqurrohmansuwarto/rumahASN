import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import RiwayatUsulanLayout from "@/components/RiwayatUsulan/RiwayatUsulanLayout";
import RwUsulanPerbaikanNama from "@/components/RiwayatUsulan/RwUsulanPerbaikanNama";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const PerbaikanNama = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data SKP</title>
      </Head>
      <PageContainer
        onBack={() => router.push("/pemutakhiran-data/komparasi")}
        title="Usulan SIASN"
        subTitle="Usulan Perbaikan Nama"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/pemutakhiran-data/komparasi">Integrasi MyASN</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Usulan Perbaikan Nama</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <RiwayatUsulanLayout
          title="Usulan SIASN"
          content="Riwayat Usulan SIASN Perbaikan Nama"
          active="perbaikan-nama"
          breadcrumbTitle="Usulan Perbaikan Nama"
        >
          <RwUsulanPerbaikanNama />
        </RiwayatUsulanLayout>
      </PageContainer>
    </>
  );
};

PerbaikanNama.Auth = {
  action: "manage",
  subject: "Tickets",
};

PerbaikanNama.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default PerbaikanNama;

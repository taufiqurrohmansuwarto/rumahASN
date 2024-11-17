import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DaftarPengadaan from "@/components/SiasnServicesAdmin/DaftarPengadaan";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

const LayananSiasnPengadaan = () => {
  return (
    <>
      <Head>
        <title>Layanan SIASN - Pengadaan</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Layanan SIASN</Breadcrumb.Item>
              <Breadcrumb.Item>Pengadaan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Pengadaan"
        subTitle="Daftar Pengadaan"
      >
        <DaftarPengadaan />
      </PageContainer>
    </>
  );
};

LayananSiasnPengadaan.getLayout = function (page) {
  return (
    <Layout active="/apps-managements/siasn-services/pengadaan">{page}</Layout>
  );
};

LayananSiasnPengadaan.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LayananSiasnPengadaan;

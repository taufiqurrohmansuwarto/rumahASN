import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DaftarPengadaan from "@/components/SiasnServicesAdmin/DaftarPengadaan";
import Head from "next/head";

const LayananSiasnPengadaan = () => {
  return (
    <>
      <Head>
        <title>Layanan SIASN - Pengadaan</title>
      </Head>
      <PageContainer title="Pengadaan" subTitle="Daftar Pengadaan">
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

import Layout from "@/components/Layout";
import DaftarStandarPelayanan from "@/components/PusatBantuan/DaftarStandarPelayanan";
import Head from "next/head";

const { default: PageContainer } = require("@/components/PageContainer");

const StandarPelayanan = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Standar Pelayanan</title>
      </Head>
      <PageContainer>
        <DaftarStandarPelayanan />
      </PageContainer>
    </>
  );
};

StandarPelayanan.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

StandarPelayanan.getLayout = (page) => <Layout>{page}</Layout>;

export default StandarPelayanan;

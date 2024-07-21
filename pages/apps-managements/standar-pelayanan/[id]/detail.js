import Layout from "@/components/Layout";
import DetailStandarLayanan from "@/components/PusatBantuan/DetailStandarLayanan";
import Head from "next/head";
import { useRouter } from "next/router";

const { default: PageContainer } = require("@/components/PageContainer");

const DetailStandarPelayanan = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Rumah ASN - Standar Pelayanan - Detail Standar Pelayanan</title>
      </Head>
      <PageContainer
        title="Detail Pelayanan"
        content="Standar Pelayanan"
        onBack={() => router.back()}
      >
        <DetailStandarLayanan />
      </PageContainer>
    </>
  );
};

DetailStandarPelayanan.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

DetailStandarPelayanan.getLayout = (page) => (
  <Layout active="/apps-managements/standar-pelayanan">{page}</Layout>
);

export default DetailStandarPelayanan;

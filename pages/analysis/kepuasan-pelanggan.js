import Layout from "@/components/Layout";
import Head from "next/head";

function KepuasanPelanggan() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Kepuasan Pelanggan</title>
      </Head>
    </>
  );
}

KepuasanPelanggan.getLayout = function getLayout(page) {
  return <Layout active="/analysis/kepuasan-pelanggan">{page}</Layout>;
};

KepuasanPelanggan.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default KepuasanPelanggan;

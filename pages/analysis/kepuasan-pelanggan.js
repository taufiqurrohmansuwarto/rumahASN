import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

function KepuasanPelanggan() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Kepuasan Pelanggan</title>
      </Head>
      <PageContainer title="Analisis" subTitle="Kepuasan Pelanggan">
        {/* <PlotKepuasanPelanggan /> */}
      </PageContainer>
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

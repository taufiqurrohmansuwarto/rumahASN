import PlotKepuasanPelanggan from "@/components/Dashboards/PlotKepuasanPelanggan";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function KepuasanPelanggan() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Kepuasan Pelanggan</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="Analisis"
        subTitle="Kepuasan Pelanggan"
      >
        <PlotKepuasanPelanggan />
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

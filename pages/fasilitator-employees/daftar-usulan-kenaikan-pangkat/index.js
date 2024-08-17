import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CariKPPerangkatDaerah from "@/components/SiasnServicesAdmin/CariKPPerangkatDaerah";
import Head from "next/head";

function DaftarUsulanKenaikanPangkat() {
  return (
    <>
      <Head>
        <title>Disparitas Unor - Fasilitator</title>
      </Head>
      <PageContainer title="Daftar Usulan Kenaikan Pangkat">
        <CariKPPerangkatDaerah />
      </PageContainer>
    </>
  );
}

DaftarUsulanKenaikanPangkat.Auth = {
  action: "manage",
  subject: "Feeds",
};

DaftarUsulanKenaikanPangkat.getLayout = function getLayout(page) {
  return (
    <Layout active="/fasilitator-employees/daftar-usulan-kenaikan-pangkat">
      {page}
    </Layout>
  );
};

export default DaftarUsulanKenaikanPangkat;

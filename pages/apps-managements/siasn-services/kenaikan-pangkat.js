import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DaftarKenaikanPangkat from "@/components/SiasnServicesAdmin/DaftarKenaikanPangkat";
import Head from "next/head";

const LayananSiasnKenaikanPangkat = () => {
  return (
    <>
      <Head>
        <title>Daftar Kenaikan Pangkat</title>
        <meta name="description" content="Daftar Kenaikan Pangkat" />
      </Head>
      <PageContainer
        title="Daftar Kenaikan Pangkat"
        content="Daftar Kenaikan Pangkat"
      >
        <DaftarKenaikanPangkat />
      </PageContainer>
    </>
  );
};

LayananSiasnKenaikanPangkat.getLayout = function (page) {
  return (
    <Layout active="/apps-managements/siasn-services/kenaikan-pangkat">
      {page}
    </Layout>
  );
};

LayananSiasnKenaikanPangkat.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LayananSiasnKenaikanPangkat;

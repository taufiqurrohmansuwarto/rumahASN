import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DaftarPemberhentian from "@/components/SiasnServicesAdmin/DaftarPemberhentian";
import Head from "next/head";

const LayananSiasnPemberhentian = () => {
  return (
    <>
      <Head>
        <title>Layanan Siasn Pemberhentian</title>
      </Head>
      <PageContainer title="Daftar Pemberhentian">
        <DaftarPemberhentian />
      </PageContainer>
    </>
  );
};

LayananSiasnPemberhentian.getLayout = function (page) {
  return (
    <Layout active="/apps-managements/siasn-services/pemberhentian">
      {page}
    </Layout>
  );
};

LayananSiasnPemberhentian.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LayananSiasnPemberhentian;

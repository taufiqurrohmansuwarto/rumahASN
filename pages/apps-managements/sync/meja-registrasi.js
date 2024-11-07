import ReportEmployees from "@/components/LayananSIASN/ReportEmployees";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import MejaRegistrasiAdmin from "@/components/PengadaanASN/MejaRegistrasiAdmin";
import SinkronLayout from "@/components/Sinkron/SinkronLayout";
import { Card } from "antd";
import Head from "next/head";

const MejaRegistrasi = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Apps Management - Meja Registrasi</title>
      </Head>
      <PageContainer content="Meja Registrasi" title="Meja Registrasi">
        <SinkronLayout active="meja-registrasi">
          <Card>
            <MejaRegistrasiAdmin />
          </Card>
        </SinkronLayout>
      </PageContainer>
    </>
  );
};

MejaRegistrasi.getLayout = (page) => (
  <Layout active="/apps-managements/sync/data">{page}</Layout>
);

MejaRegistrasi.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default MejaRegistrasi;

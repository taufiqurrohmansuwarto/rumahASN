import DisparitasUnorSIASN from "@/components/Disparitas/DisparitasUnorSIASN";
import Dashboard from "@/components/Fasilitator/DashboardKompareFasilitator";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Card } from "antd";
import Head from "next/head";

function DashboardRekap() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Dashboard Rekap - Fasilitator</title>
      </Head>
      <PageContainer title="Dashboard Rekap">
        <Card>
          <Dashboard />
        </Card>
      </PageContainer>
    </>
  );
}

DashboardRekap.Auth = {
  action: "manage",
  subject: "Feeds",
};

DashboardRekap.getLayout = function getLayout(page) {
  return (
    <Layout active="/fasilitator-employees/dashboard-rekap">{page}</Layout>
  );
};

export default DashboardRekap;

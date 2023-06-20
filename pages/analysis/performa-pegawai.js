import PlotAgentPerformances from "@/components/Dashboards/PlotAgentPerformances";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";

function PerformaPegawai() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Performa Pegawai</title>
      </Head>
      <PageContainer title="Analisis" subTitle="Performa Pegawai">
        <PlotAgentPerformances />
      </PageContainer>
    </>
  );
}

PerformaPegawai.getLayout = function getLayout(page) {
  return <Layout active="/analysis/performa-pegawai">{page}</Layout>;
};

PerformaPegawai.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default PerformaPegawai;

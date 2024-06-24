import PlotAgentPerformances from "@/components/Dashboards/PlotAgentPerformances";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function PerformaPegawai() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Performa Pegawai</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="Analisis"
        subTitle="Performa Pegawai"
      >
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

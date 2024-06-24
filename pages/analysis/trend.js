import PlotTrendQuestion from "@/components/Dashboards/PlotTrendQuestion";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function Trend() {
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Trend</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="Analisis"
        subTitle="Trend Pertanyaan"
      >
        <PlotTrendQuestion />
      </PageContainer>
    </>
  );
}

Trend.getLayout = function getLayout(page) {
  return <Layout active="/analysis/trend">{page}</Layout>;
};

Trend.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default Trend;

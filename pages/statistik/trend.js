import PlotTrendQuestion from "@/components/Dashboards/PlotTrendQuestion";
import PageContainer from "@/components/PageContainer";
import StatistikLayout from "@/components/Statistik/StatistikLayout";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

function Trend() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Statistik - Trend Pertanyaan</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/statistik/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Trend Pertanyaan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Statistik"
        content="Trend Pertanyaan"
      >
        <PlotTrendQuestion />
      </PageContainer>
    </>
  );
}

Trend.getLayout = function getLayout(page) {
  return <StatistikLayout active="/statistik/trend">{page}</StatistikLayout>;
};

Trend.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Trend;

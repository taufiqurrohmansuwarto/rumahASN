import PlotAgentPerformances from "@/components/Dashboards/PlotAgentPerformances";
import PageContainer from "@/components/PageContainer";
import StatistikLayout from "@/components/Statistik/StatistikLayout";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

function PerformaPegawai() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Statistik - Performa Pegawai</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/statistik/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Performa Pegawai</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Statistik"
        content="Performa Pegawai"
      >
        <PlotAgentPerformances />
      </PageContainer>
    </>
  );
}

PerformaPegawai.getLayout = function getLayout(page) {
  return (
    <StatistikLayout active="/statistik/performa-pegawai">
      {page}
    </StatistikLayout>
  );
};

PerformaPegawai.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default PerformaPegawai;

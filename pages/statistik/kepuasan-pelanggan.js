import PlotKepuasanPelanggan from "@/components/Dashboards/PlotKepuasanPelanggan";
import PageContainer from "@/components/PageContainer";
import StatistikLayout from "@/components/Statistik/StatistikLayout";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";

function KepuasanPelanggan() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Statistik - Kepuasan Pelanggan</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/statistik/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Kepuasan Pelanggan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Statistik"
        content="Kepuasan Pelanggan"
      >
        <PlotKepuasanPelanggan />
      </PageContainer>
    </>
  );
}

KepuasanPelanggan.getLayout = function getLayout(page) {
  return (
    <StatistikLayout active="/statistik/kepuasan-pelanggan">
      {page}
    </StatistikLayout>
  );
};

KepuasanPelanggan.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default KepuasanPelanggan;

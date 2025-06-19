import LayananKeuanganLandingPage from "@/components/LayananKeuangan/LayananKeuanganLandingPage";
import LayananKeuanganLayout from "@/components/LayananKeuangan/LayananKeuanganLayout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { Breadcrumb } from "antd";
import Link from "next/link";

const Dashboard = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Dashboard - Layanan Keuangan</title>
      </Head>
      <PageContainer
        title="Dashboard Layanan Keuangan ASN"
        content="Kelola dan pantau layanan keuangan Anda dengan mudah dan aman"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Dashboard Layanan Keuangan</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <LayananKeuanganLandingPage />
      </PageContainer>
    </>
  );
};

Dashboard.getLayout = function getLayout(page) {
  return (
    <LayananKeuanganLayout active="/layanan-keuangan/dashboard">
      {page}
    </LayananKeuanganLayout>
  );
};

Dashboard.Auth = {
  action: "manage",
  subject: "Layanan Keuangan",
};

export default Dashboard;

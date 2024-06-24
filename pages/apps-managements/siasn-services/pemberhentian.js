import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DaftarPemberhentian from "@/components/SiasnServicesAdmin/DaftarPemberhentian";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

const LayananSiasnPemberhentian = () => {
  return (
    <>
      <Head>
        <title>Layanan SIASN - Daftar Pemberhentian</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Layanan SIASN</Breadcrumb.Item>
              <Breadcrumb.Item>Pemberhentian</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Daftar Pemberhentian"
      >
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

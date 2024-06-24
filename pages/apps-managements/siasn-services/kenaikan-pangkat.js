import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DaftarKenaikanPangkat from "@/components/SiasnServicesAdmin/DaftarKenaikanPangkat";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

const LayananSiasnKenaikanPangkat = () => {
  return (
    <>
      <Head>
        <title>Layanan SIASN - Daftar Kenaikan Pangkat - Rumah ASN</title>
        <meta name="description" content="Daftar Kenaikan Pangkat" />
      </Head>
      <PageContainer
        title="Daftar Kenaikan Pangkat"
        content="Daftar Kenaikan Pangkat"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Layanan SIASN</Breadcrumb.Item>
              <Breadcrumb.Item>Kenaikan Pangkat</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <DaftarKenaikanPangkat />
      </PageContainer>
    </>
  );
};

LayananSiasnKenaikanPangkat.getLayout = function (page) {
  return (
    <Layout active="/apps-managements/siasn-services/kenaikan-pangkat">
      {page}
    </Layout>
  );
};

LayananSiasnKenaikanPangkat.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LayananSiasnKenaikanPangkat;

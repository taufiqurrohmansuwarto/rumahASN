import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DaftarKenaikanPangkat from "@/components/SiasnServicesAdmin/DaftarKenaikanPangkat";
import KenaikanPangkatLayout from "@/components/SiasnServicesAdmin/KenaikanPangkatLayout";
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
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Layanan SIASN</Breadcrumb.Item>
              <Breadcrumb.Item>Kenaikan Pangkat</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <KenaikanPangkatLayout>
          <DaftarKenaikanPangkat />
        </KenaikanPangkatLayout>
      </PageContainer>
    </>
  );
};

LayananSiasnKenaikanPangkat.getLayout = function (page) {
  return (
    <Layout active="/apps-managements/siasn-services/kenaikan-pangkat/sync">
      {page}
    </Layout>
  );
};

LayananSiasnKenaikanPangkat.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LayananSiasnKenaikanPangkat;

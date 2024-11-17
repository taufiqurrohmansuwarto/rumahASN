import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CariKPPerangkatDaerah from "@/components/SiasnServicesAdmin/CariKPPerangkatDaerah";
import DaftarKenaikanPangkat from "@/components/SiasnServicesAdmin/DaftarKenaikanPangkat";
import KenaikanPangkatLayout from "@/components/SiasnServicesAdmin/KenaikanPangkatLayout";
import UnorAdmin from "@/components/SiasnServicesAdmin/UnorAdmin";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

const LayananSiasnKenaikanPangkatPerangkatDaerah = () => {
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
        <KenaikanPangkatLayout active="perangkat-daerah">
          <CariKPPerangkatDaerah />
        </KenaikanPangkatLayout>
      </PageContainer>
    </>
  );
};

LayananSiasnKenaikanPangkatPerangkatDaerah.getLayout = function (page) {
  return (
    <Layout active="/apps-managements/siasn-services/kenaikan-pangkat/sync">
      {page}
    </Layout>
  );
};

LayananSiasnKenaikanPangkatPerangkatDaerah.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LayananSiasnKenaikanPangkatPerangkatDaerah;

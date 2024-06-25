import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DisparitasDataUnor from "@/components/SiasnServicesAdmin/DisparitasDataUnor";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

const DisparitasUnor = () => {
  return (
    <>
      <Head>
        <title>Disparitas Unor</title>
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
        <DisparitasDataUnor />
      </PageContainer>
    </>
  );
};

DisparitasUnor.getLayout = function (page) {
  return (
    <Layout active="/apps-managements/siasn-services/disparitas-unor">
      {page}
    </Layout>
  );
};

DisparitasUnor.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default DisparitasUnor;

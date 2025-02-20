import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CariKPPerangkatDaerah from "@/components/SiasnServicesAdmin/CariKPPerangkatDaerah";
import Head from "next/head";
import { Breadcrumb, Grid } from "antd";
import Link from "next/link";

function DaftarUsulanKenaikanPangkat() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Disparitas Unor - Fasilitator</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Forum Kepegawaian</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/fasilitator-employees/master-data">Data ASN</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Usulan Kenaikan Pangkat</Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/fasilitator-employees/daftar-usulan-pensiun">
                  Usulan Pensiun
                </Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title={null}
      >
        <CariKPPerangkatDaerah />
      </PageContainer>
    </>
  );
}

DaftarUsulanKenaikanPangkat.Auth = {
  action: "manage",
  subject: "Feeds",
};

DaftarUsulanKenaikanPangkat.getLayout = function getLayout(page) {
  return (
    <Layout active="/fasilitator-employees/daftar-usulan-kenaikan-pangkat">
      {page}
    </Layout>
  );
};

export default DaftarUsulanKenaikanPangkat;

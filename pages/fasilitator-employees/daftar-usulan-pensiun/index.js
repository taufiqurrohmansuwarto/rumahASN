import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CariPemberhentianPerangkatDaerah from "@/components/SiasnServicesAdmin/CariPemberhentianPerangkatDaerah";
import Head from "next/head";
import { Breadcrumb, Grid } from "antd";
import Link from "next/link";

function DaftarUsulanPensiun() {
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
              <Breadcrumb.Item>Usulan Pensiun</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title={null}
      >
        <CariPemberhentianPerangkatDaerah />
      </PageContainer>
    </>
  );
}

DaftarUsulanPensiun.Auth = {
  action: "manage",
  subject: "Feeds",
};

DaftarUsulanPensiun.getLayout = function getLayout(page) {
  return (
    <Layout active="/fasilitator-employees/daftar-usulan-pensiun">
      {page}
    </Layout>
  );
};

export default DaftarUsulanPensiun;

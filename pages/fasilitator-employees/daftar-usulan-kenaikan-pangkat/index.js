import DisparitasUnorSIASN from "@/components/Disparitas/DisparitasUnorSIASN";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Card } from "antd";
import Head from "next/head";

function DaftarUsulanKenaikanPangkat() {
  return (
    <>
      <Head>
        <title>Disparitas Unor - Fasilitator</title>
      </Head>
      <PageContainer title="Daftar Usulan Kenaikan Pangkat">
        <Card>
          <div>Sabar yaa...</div>
        </Card>
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

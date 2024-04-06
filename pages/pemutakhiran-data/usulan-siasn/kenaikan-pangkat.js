import Layout from "@/components/Layout";
import RiwayatUsulanLayout from "@/components/RiwayatUsulan/RiwayatUsulanLayout";
import RwUsulanKenaikanPangkat from "@/components/RiwayatUsulan/RwUsulanKenaikanPangkat";
import { Card } from "antd";
import Head from "next/head";

const KenaikanPangkat = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data SKP</title>
      </Head>
      <RiwayatUsulanLayout
        title="Usulan SIASN"
        content="Riwayat Usulan SIASN Kenaikan Pangkat"
        active="kenaikan-pangkat"
        breadcrumbTitle="Usulan Kenaikan Pangkat"
      >
        <Card>
          <RwUsulanKenaikanPangkat />
        </Card>
      </RiwayatUsulanLayout>
    </>
  );
};

KenaikanPangkat.Auth = {
  action: "manage",
  subject: "Tickets",
};

KenaikanPangkat.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default KenaikanPangkat;

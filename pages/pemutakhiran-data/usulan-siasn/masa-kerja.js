import Layout from "@/components/Layout";
import RiwayatUsulanLayout from "@/components/RiwayatUsulan/RiwayatUsulanLayout";
import RwUsulanPMK from "@/components/RiwayatUsulan/RwUsulanPMK";
import { Card } from "antd";
import Head from "next/head";

const MasaKerja = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data SKP</title>
      </Head>
      <RiwayatUsulanLayout
        title="Usulan SIASN"
        content="Riwayat Usulan SIASN Masa Kerja"
        active="masa-kerja"
        breadcrumbTitle="Usulan Masa Kerja"
      >
        <Card>
          <RwUsulanPMK />
        </Card>
      </RiwayatUsulanLayout>
    </>
  );
};

MasaKerja.Auth = {
  action: "manage",
  subject: "Tickets",
};

MasaKerja.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default MasaKerja;

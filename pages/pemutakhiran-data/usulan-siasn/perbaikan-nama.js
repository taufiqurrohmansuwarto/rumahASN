import Layout from "@/components/Layout";
import RiwayatUsulanLayout from "@/components/RiwayatUsulan/RiwayatUsulanLayout";
import { Card } from "antd";
import Head from "next/head";

const PerbaikanNama = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data SKP</title>
      </Head>
      <RiwayatUsulanLayout
        title="Usulan SIASN"
        content="Riwayat Usulan SIASN Perbaikan Nama"
        active="perbaikan-nama"
        breadcrumbTitle="Usulan Perbaikan Nama"
      >
        <Card></Card>
      </RiwayatUsulanLayout>
    </>
  );
};

PerbaikanNama.Auth = {
  action: "manage",
  subject: "Tickets",
};

PerbaikanNama.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default PerbaikanNama;

import Layout from "@/components/Layout";
import RiwayatUsulanLayout from "@/components/RiwayatUsulan/RiwayatUsulanLayout";
import { Card } from "antd";
import Head from "next/head";

const Pemberhentian = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data SKP</title>
      </Head>
      <RiwayatUsulanLayout
        title="Usulan SIASN"
        content="Riwayat Usulan SIASN Pemberhentian"
        active="pemberhentian"
        breadcrumbTitle="Usulan Pemberhentian"
      >
        <Card></Card>
      </RiwayatUsulanLayout>
    </>
  );
};

Pemberhentian.Auth = {
  action: "manage",
  subject: "Tickets",
};

Pemberhentian.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default Pemberhentian;

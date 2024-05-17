import Layout from "@/components/Layout";
import RiwayatUsulanLayout from "@/components/RiwayatUsulan/RiwayatUsulanLayout";
import { Card } from "antd";
import Head from "next/head";
import RiwayatPencantumanGelar from "../pencantuman-gelar";
import RwUsulanPencantumanGelar from "@/components/RiwayatUsulan/RwUsulanPencantumanGelar";

const PencantumanGelar = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data SKP</title>
      </Head>
      <RiwayatUsulanLayout
        title="Usulan SIASN"
        content="Riwayat Usulan SIASN Pencantuman Gelar"
        active="pencantuman-gelar"
        breadcrumbTitle="Usulan Pencantuman Gelar"
      >
        <Card>
          <RwUsulanPencantumanGelar />
        </Card>
      </RiwayatUsulanLayout>
    </>
  );
};

PencantumanGelar.Auth = {
  action: "manage",
  subject: "Tickets",
};

PencantumanGelar.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default PencantumanGelar;

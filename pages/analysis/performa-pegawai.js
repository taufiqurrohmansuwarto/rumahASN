import Layout from "@/components/Layout";
import Head from "next/head";

function PerformaPegawai() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Analisis - Performa Pegawai</title>
      </Head>
    </>
  );
}

PerformaPegawai.getLayout = function getLayout(page) {
  return <Layout active="/analysis/performa-pegawai">{page}</Layout>;
};

PerformaPegawai.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default PerformaPegawai;

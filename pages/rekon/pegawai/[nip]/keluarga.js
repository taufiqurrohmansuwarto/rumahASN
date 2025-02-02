import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import DaftarPegawai from "@/components/Rekon/DaftarPegawai";
import Head from "next/head";

const Keluarga = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Pegawai</title>
      </Head>
      <PageContainer title="Rekon" content="Pegawai">
        <DaftarPegawai />
      </PageContainer>
    </>
  );
};

Keluarga.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

Keluarga.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Keluarga;

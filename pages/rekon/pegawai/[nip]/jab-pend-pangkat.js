import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import DaftarPegawai from "@/components/Rekon/DaftarPegawai";
import Head from "next/head";

const JabatanPendidikanPangkat = () => {
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

JabatanPendidikanPangkat.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

JabatanPendidikanPangkat.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default JabatanPendidikanPangkat;

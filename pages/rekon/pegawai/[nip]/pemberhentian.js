import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import DaftarPegawai from "@/components/Rekon/DaftarPegawai";
import Head from "next/head";

const Pemberhentian = () => {
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

Pemberhentian.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

Pemberhentian.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Pemberhentian;

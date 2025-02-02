import PageContainer from "@/components/PageContainer";
import DaftarPegawai from "@/components/Rekon/DaftarPegawai";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";

const AngkaKredit = () => {
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

AngkaKredit.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

AngkaKredit.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AngkaKredit;

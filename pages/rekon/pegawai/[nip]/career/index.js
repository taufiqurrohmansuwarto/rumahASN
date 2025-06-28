import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";

const RiwayatKarir = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Riwayat Karir</title>
      </Head>
      <PageContainer title="Rekon" content="Riwayat Karir"></PageContainer>
    </>
  );
};

RiwayatKarir.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

RiwayatKarir.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RiwayatKarir;

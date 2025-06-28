import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";

const LegalPenghargaan = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Penghargaan</title>
      </Head>
      <PageContainer title="Rekon" content="Penghargaan"></PageContainer>
    </>
  );
};

LegalPenghargaan.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

LegalPenghargaan.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default LegalPenghargaan;

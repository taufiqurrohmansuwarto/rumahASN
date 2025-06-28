import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";

const LegalHukdis = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Hukdis</title>
      </Head>
      <PageContainer title="Rekon" content="Hukdis"></PageContainer>
    </>
  );
};

LegalHukdis.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

LegalHukdis.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default LegalHukdis;

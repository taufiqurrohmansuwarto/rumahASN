import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";

const LegalCLTN = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - CLTN</title>
      </Head>
      <PageContainer title="Rekon" content="CLTN"></PageContainer>
    </>
  );
};

LegalCLTN.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

LegalCLTN.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default LegalCLTN;

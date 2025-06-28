import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";

const LegalPemberhentian = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Pemberhentian</title>
      </Head>
      <PageContainer title="Rekon" content="Pemberhentian"></PageContainer>
    </>
  );
};

LegalPemberhentian.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

LegalPemberhentian.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default LegalPemberhentian;

import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";

const Personal = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Personal</title>
      </Head>
      <PageContainer title="Rekon" content="Personal"></PageContainer>
    </>
  );
};

Personal.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

Personal.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Personal;

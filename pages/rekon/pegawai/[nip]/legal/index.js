import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";

const Legal = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Karier Jabatan</title>
      </Head>
      <PageContainer title="Rekon" content="Karier Jabatan"></PageContainer>
    </>
  );
};

Legal.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

Legal.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Legal;

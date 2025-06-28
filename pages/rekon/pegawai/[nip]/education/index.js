import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";

const Pendidikan = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Pendidikan</title>
      </Head>
      <PageContainer title="Rekon" content="Pendidikan"></PageContainer>
    </>
  );
};

Pendidikan.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

Pendidikan.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Pendidikan;

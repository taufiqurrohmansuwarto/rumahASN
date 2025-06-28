import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";

const Performance = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Performance</title>
      </Head>
      <PageContainer title="Rekon" content="Performance"></PageContainer>
    </>
  );
};

Performance.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

Performance.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Performance;

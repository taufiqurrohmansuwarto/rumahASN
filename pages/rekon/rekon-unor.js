import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import RekonUnorSIASN from "@/components/Rekon/RekonUnorSIASN";
import RekonLayout from "@/components/Rekon/RekonLayout";

const RekonUnor = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Rekon Unor</title>
      </Head>
      <PageContainer title="Rekon Unor">
        <RekonUnorSIASN />
      </PageContainer>
    </>
  );
};

RekonUnor.getLayout = (page) => {
  return <RekonLayout active="/rekon/rekon-unor">{page}</RekonLayout>;
};

RekonUnor.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonUnor;

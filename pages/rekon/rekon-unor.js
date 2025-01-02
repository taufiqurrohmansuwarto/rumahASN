import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import RekonUnorSIASN from "@/components/Rekon/RekonUnorSIASN";

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

RekonUnor.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonUnor;

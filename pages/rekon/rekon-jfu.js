import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonJfuSIASN from "@/components/Rekon/RekonJfuSIASN";
import Head from "next/head";

const RekonJfu = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Rekon JFT</title>
      </Head>
      <PageContainer title="Rekon" content="Jabatan Pelaksana">
        <RekonJfuSIASN />
      </PageContainer>
    </>
  );
};

RekonJfu.getLayout = (page) => {
  return <RekonLayout active="/rekon/rekon-jfu">{page}</RekonLayout>;
};

RekonJfu.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonJfu;

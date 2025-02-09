import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonJfuSIASN from "@/components/Rekon/RekonJfuSIASN";
import Head from "next/head";
import { Grid } from "antd";

const RekonJfu = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Rekon JFT</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Rekon"
        content="Jabatan Pelaksana"
      >
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

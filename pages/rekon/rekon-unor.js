import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import RekonUnorSIASN from "@/components/Rekon/RekonUnorSIASN";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";

const RekonUnor = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Rekon Unor</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Rekon"
        content="Unit Organisasi"
      >
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

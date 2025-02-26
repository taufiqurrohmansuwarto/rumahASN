import PageContainer from "@/components/PageContainer";
import RekonJftSIASN from "@/components/Rekon/RekonJftSIASN";
import RekonLayout from "@/components/Rekon/RekonLayout";
import Head from "next/head";
import { Grid } from "antd";

const RekonJft = () => {
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
        content="Jabatan Fungsional"
      >
        <RekonJftSIASN />
      </PageContainer>
    </>
  );
};

RekonJft.getLayout = (page) => {
  return <RekonLayout active="/rekon/rekon-jft">{page}</RekonLayout>;
};

RekonJft.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonJft;

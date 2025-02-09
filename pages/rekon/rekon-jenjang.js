import RedditPost from "@/components/Discussions/RedditPost";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";

const RekonJenjang = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Rekon Jenjang</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Rekon"
        content="Jenjang"
      >
        <RedditPost />
      </PageContainer>
    </>
  );
};

RekonJenjang.getLayout = (page) => {
  return <RekonLayout active="/rekon/rekon-jenjang">{page}</RekonLayout>;
};

RekonJenjang.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonJenjang;

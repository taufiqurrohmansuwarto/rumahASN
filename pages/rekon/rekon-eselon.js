import RedditPost from "@/components/Discussions/RedditPost";
import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import { Grid } from "antd";
import Head from "next/head";

const RekonEselon = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Rekon Eselon</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Rekon"
        content="Eselon"
      >
        <RedditPost />
      </PageContainer>
    </>
  );
};

RekonEselon.getLayout = (page) => {
  return <RekonLayout active="/rekon/rekon-eselon">{page}</RekonLayout>;
};

RekonEselon.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RekonEselon;

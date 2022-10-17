import { Button } from "antd";
import { signOut, useSession } from "next-auth/react";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";

function FeedDetail() {
  const { data, status } = useSession();

  return (
    <PageContainer title="Beranda" subTitle="Feeds">
      <Button onClick={() => signOut()}>Logout</Button>
    </PageContainer>
  );
}

FeedDetail.Auth = {
  action: "manage",
  subject: "Feeds",
};

FeedDetail.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default FeedDetail;

import { Button } from "antd";
import { signOut, useSession } from "next-auth/react";
import BannerBKD from "../../src/components/BannerBKD";
import BeritaBKD from "../../src/components/BeritaBKD";
import Comments from "../../src/components/Comments";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";

function Feeds() {
  const { data, status } = useSession();

  return (
    <PageContainer title="Beranda" subTitle="Feeds">
      <Button onClick={() => signOut()}>Logout</Button>
      {/* <BeritaBKD /> */}
      <BannerBKD />
      <Comments />
    </PageContainer>
  );
}

Feeds.Auth = {
  action: "manage",
  subject: "Feeds",
};

Feeds.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default Feeds;

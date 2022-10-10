import { Button } from "antd";
import { signOut, useSession } from "next-auth/react";
import Layout from "../src/components/Layout";
import PageContainer from "../src/components/PageContainer";

function Feeds() {
  const { data, status } = useSession();
  return (
    <PageContainer>
      <p>tempat orang2 komentar</p>
      <Button onClick={() => signOut()}>Logout</Button>
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

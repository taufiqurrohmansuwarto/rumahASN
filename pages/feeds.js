import { Button } from "antd";
import { signOut, useSession } from "next-auth/react";
import Layout from "../src/components/Layout";
import { Can } from "../src/context/Can";

function Feeds() {
  const { data, status } = useSession();
  return (
    <div>
      <p>tempat orang2 komentar</p>
      {JSON.stringify(data)}
      <Can I="create" a="Todo">
        <Button onClick={() => signOut()}>Sign Out</Button>
      </Can>
      <Button onClick={() => signOut()}>Logout</Button>
    </div>
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

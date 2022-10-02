import { Button, Card } from "antd";
import { signOut, useSession } from "next-auth/react";
import Layout from "../src/components/Layout";

function Feeds() {
  const { data } = useSession();
  return (
    <div>
      <Card>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Maiores
          fugiat nihil repellendus temporibus dolor neque id, a sed enim dolores
          ducimus laudantium, quasi ipsam in ab sit architecto, saepe iure.
        </p>
        <Button onClick={() => signOut()}>signout</Button>
      </Card>
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

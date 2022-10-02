import { Button } from "antd";
import { signOut, useSession } from "next-auth/react";

function Feeds() {
  const { data } = useSession();
  return (
    <div>
      {JSON.stringify(data?.current_role)}
      <Button onClick={() => signOut()}>signout</Button>
    </div>
  );
}

Feeds.Auth = {
  action: "manage",
  subject: "Feeds",
};

export default Feeds;

import { getPrivateMessages } from "@/services/index";
import { InboxOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "antd";
import { useRouter } from "next/router";

function Messages() {
  const router = useRouter();

  const query = {
    type: "total_unread",
  };

  const { data, isLoading } = useQuery(
    ["total-unread-messages", query],
    () => getPrivateMessages(query),
    {}
  );

  const gotoMail = () => {
    router.push("/mails/inbox");
  };

  return (
    <div onClick={gotoMail}>
      <Badge count={isLoading ? null : data?.total}>
        <InboxOutlined
          style={{
            fontSize: 15,
          }}
        />
      </Badge>
    </div>
  );
}

export default Messages;

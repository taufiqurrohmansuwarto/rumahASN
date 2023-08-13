import { getPrivateMessages } from "@/services/index";
import { MailOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "antd";
import { useRouter } from "next/router";
import React from "react";

function Messages() {
  const router = useRouter();

  const query = {
    type: "total_unread",
  };

  const { data, isLoading } = useQuery(
    ["total-unread-messages", query],
    () => getPrivateMessages(query),
    {
      refetchInterval: 5000,
    }
  );

  const gotoMail = () => {
    router.push("/mails/inbox");
  };

  return (
    <div onClick={gotoMail}>
      <Badge count={isLoading ? null : data?.total}>
        <MailOutlined
          style={{
            fontSize: 16,
          }}
        />
      </Badge>
    </div>
  );
}

export default Messages;

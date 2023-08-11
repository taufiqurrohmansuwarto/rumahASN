import { MailOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import React from "react";

function Messages() {
  const router = useRouter();

  const gotoMail = () => {
    router.push("/mails/all");
  };

  return <MailOutlined onClick={gotoMail} />;
}

export default Messages;

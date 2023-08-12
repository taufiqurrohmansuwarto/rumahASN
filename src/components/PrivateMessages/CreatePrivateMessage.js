import { MailOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useRouter } from "next/router";
import React from "react";

function CreatePrivateMessage() {
  const router = useRouter();

  const handleCreate = () => router.push("/mails/create");

  return (
    <Button icon={<MailOutlined />} type="primary" onClick={handleCreate}>
      Pesan Baru
    </Button>
  );
}

export default CreatePrivateMessage;

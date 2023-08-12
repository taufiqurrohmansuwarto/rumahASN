import { Button } from "antd";
import { useRouter } from "next/router";
import React from "react";

function CreatePrivateMessage() {
  const router = useRouter();

  const handleCreate = () => router.push("/mails/create");

  return (
    <Button type="primary" onClick={handleCreate}>
      Buat Pesan
    </Button>
  );
}

export default CreatePrivateMessage;

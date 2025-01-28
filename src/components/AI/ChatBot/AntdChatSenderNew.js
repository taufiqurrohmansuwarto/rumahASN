import { InfoCircleOutlined } from "@ant-design/icons";
import { Flex, Space, Typography } from "antd";
import { useState } from "react";
import Sender from "../Sender";

function AntdChatSenderNew({
  style,
  status,
  submitMessage,
  stop,
  setInput,
  input,
  append,
}) {
  const [text, setText] = useState("");

  const handleChangeText = (e) => {
    setText(e);
  };

  const handleSubmit = async () => {
    append({
      role: "user",
      content: text,
    });
    await submitMessage();
    setText("");
  };

  return (
    <Sender
      loading={status !== "awaiting_message"}
      placeholder="Tanya BestieAI"
      onSubmit={handleSubmit}
      value={text}
      onChange={handleChangeText}
      onCancel={stop}
    />
  );
}

export default AntdChatSenderNew;

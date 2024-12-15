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
    <div style={{ paddingBottom: "16px" }}>
      <Sender
        className={style?.sender}
        loading={status !== "awaiting_message"}
        placeholder="Ketik Pesan..."
        onSubmit={handleSubmit}
        value={text}
        onChange={handleChangeText}
        onCancel={stop}
      />

      <Flex justify="center" align="center" style={{ marginTop: "8px" }}>
        <Typography.Text type="secondary">
          <Space>
            <InfoCircleOutlined />
            <span>
              BestieAI may make mistakes. Please independently verify any
              important information.
            </span>
          </Space>
        </Typography.Text>
      </Flex>
    </div>
  );
}

export default AntdChatSenderNew;

import Sender from "../Sender";
import { Flex, Space, Typography } from "antd";

function ChatSenderWelcome({ send, loading }) {
  const handleSubmit = (message) => {
    send({ threadId: null, message });
  };

  return (
    <Flex vertical align="center" gap={10}>
      <Sender
        placeholder="Tanya BestieAI"
        loading={loading}
        onSubmit={handleSubmit}
      />
      <Typography.Text type="secondary">
        Bestie menggunakan AI. Selalu cek jika terjadi kesalahan.
      </Typography.Text>
    </Flex>
  );
}

export default ChatSenderWelcome;

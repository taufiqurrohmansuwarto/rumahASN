import { AssistantAIServices } from "@/services/assistant-ai.services";
import {
  BulbOutlined,
  EllipsisOutlined,
  InfoCircleOutlined,
  ShareAltOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Flex, Space, Spin, message } from "antd";
import { useRouter } from "next/router";
import Prompts from "../Prompts";
import Welcome from "../Welcome";
import ChatSenderWelcome from "./ChatSenderWelcome";

const items = [
  {
    key: "1",
    icon: (
      <BulbOutlined
        style={{
          color: "#FFD700",
        }}
      />
    ),
    label: "Cek Status Usulan SIASN",
    description: "Yuk cek status usulan SIASN kamu sekarang!",
  },
  {
    key: "2",
    icon: (
      <InfoCircleOutlined
        style={{
          color: "#1890FF",
        }}
      />
    ),
    label: "Siapa Kamu?",
    description: "Siapa kamu? Apa profesimu? Apa tugasmu?",
  },
];

function AntdNewChat() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate: chat, isLoading: isLoadingChat } = useMutation(
    (data) => AssistantAIServices.sendMessage(data),
    {
      onSuccess: (data) => {
        console.log(data);
        router.push(`/chat-ai/${data.threadId}`);
      },
      onError: () => {
        message.error("Gagal mengirim pesan");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["threads"]);
      },
    }
  );

  const handleItemClick = (item) => {
    const threadId = null;
    const message = item.data?.label;
    chat({ threadId, message });
  };

  return (
    <Spin spinning={isLoadingChat}>
      <Flex vertical gap={40}>
        <Welcome
          extra={
            <Space>
              <Button icon={<ShareAltOutlined />} />
              <Button icon={<EllipsisOutlined />} />
            </Space>
          }
          icon="https://siasn.bkd.jatimprov.go.id:9000/public/bestie-ai-rect-avatar.png"
          title="Bestie (BKD Expert System & Technical Intelligence Engine)"
          description="Your HR Bestie, Always Ready!"
        />
        <Prompts
          onItemClick={handleItemClick}
          wrap
          title="✨ Inspirational Sparks and Marvelous Tips"
          items={items}
        />
        <ChatSenderWelcome send={chat} loading={isLoadingChat} />
      </Flex>
    </Spin>
  );
}

export default AntdNewChat;

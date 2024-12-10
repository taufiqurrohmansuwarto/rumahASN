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
      <BulbOutlined
        style={{
          color: "#FFD700",
        }}
      />
    ),
    label: "Pangkat",
    description: "Berapa kali periodesasi kenaikan pangkat?",
  },
  {
    key: "3",
    icon: (
      <BulbOutlined
        style={{
          color: "#FFD700",
        }}
      />
    ),
    label: "Buat SPT!",
    description: "Buatkan SPT/Surat Perintah Tugas",
  },
  {
    key: "4",
    icon: (
      <BulbOutlined
        style={{
          color: "#FFD700",
        }}
      />
    ),
    label: "Hukuman Disiplin",
    description: "Apakah selingkuh itu termasuk hukuman disiplin berat?",
  },
  {
    key: "5",
    icon: (
      <BulbOutlined
        style={{
          color: "#FFD700",
        }}
      />
    ),
    label: "Usulan Formasi",
    description:
      "Berapa usulan formasi Pranata Komputer di Pemerintah Provinsi Jawa Timur?",
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

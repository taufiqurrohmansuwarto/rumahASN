import { AssistantAIServices } from "@/services/assistant-ai.services";
import {
  BulbOutlined,
  EllipsisOutlined,
  InfoCircleOutlined,
  ShareAltOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Col, Flex, Grid, Row, Space, Spin, message } from "antd";
import { useRouter } from "next/router";
import Prompts from "../Prompts";
import Welcome from "../Welcome";
import AntdTesting from "./AntdTesting";
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
    label: "Status Usulan SIASN",
    description: "Tolong cek status usulan saya di SIASN",
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
    description: "Berapa kali periodisasi kenaikan pangkat?",
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
    label: "Surat Peritah Tugas",
    description: "Buatkan SPT/Surat Perintah Tugas",
  },
  {
    key: "5",
    icon: (
      <BulbOutlined
        style={{
          color: "#1890FF",
        }}
      />
    ),
    label: "Lupa Absen",
    description: "Tolong buatkan surat keterangan lupa absen saya",
  },
  {
    key: "4",
    icon: (
      <WarningOutlined
        style={{
          color: "#FF0000",
        }}
      />
    ),
    label: "Hukuman Disiplin",
    description: "Apakah selingkuh itu termasuk hukuman disiplin berat?",
  },
  {
    key: "5",
    icon: (
      <InfoCircleOutlined
        style={{
          color: "#1890FF",
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

  const breakPoint = Grid.useBreakpoint();

  const { mutate: chat, isLoading: isLoadingChat } = useMutation(
    (data) => AssistantAIServices.sendMessage(data),
    {
      onSuccess: (data) => {
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
    const message = item.data?.description;
    chat({ threadId, message });
  };

  return (
    <Spin spinning={isLoadingChat}>
      <Card
        style={{
          minHeight: "86vh",
          display: "flex",
          alignItems: breakPoint?.xs ? "flex-start" : "center",
          justifyContent: breakPoint?.xs ? "flex-start" : "center",
        }}
      >
        <Row
          justify={breakPoint?.xs ? "start" : "center"}
          style={{ width: "100%" }}
        >
          <Col md={14}>
            <Flex vertical gap={40}>
              <Welcome
                icon="https://siasn.bkd.jatimprov.go.id:9000/public/bestie-ai-rect-avatar.png"
                title="BestieAI (BKD Expert System & Technical Intelligence Engine)"
                description="Your HR Bestie, Always Ready!"
              />
              <Prompts
                onItemClick={handleItemClick}
                wrap
                // bahasa indonesia saja
                title="💡 Pilih Topik"
                // ketika xs maka hanya tampil 3 item saja
                items={items.slice(0, breakPoint?.xs ? 3 : items.length)}
              />
              <ChatSenderWelcome send={chat} loading={isLoadingChat} />
            </Flex>
          </Col>
        </Row>
      </Card>
    </Spin>
  );
}

export default AntdNewChat;

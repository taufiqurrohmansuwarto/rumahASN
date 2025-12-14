import { useState } from "react";
import Head from "next/head";
import { Button, Typography, Empty } from "antd";
import { IconMessageCircle, IconPlus } from "@tabler/icons-react";
import ChatLayout from "@/components/ChatLayout";
import { CreateChannelModal } from "@/components/RasnChat";
import { useChatStats } from "@/hooks/useRasnChat";
import PageContainer from "@/components/PageContainer";

const { Title, Text } = Typography;

function RasnChatIndex() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { data: stats } = useChatStats();

  return (
    <>
      <Head>
        <title>Rumah ASN - RASN Chat</title>
      </Head>

      <PageContainer title="RASN Chat">
        <div
          style={{
            height: "calc(100vh - 200px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <IconMessageCircle size={64} color="#d9d9d9" />

          <Title level={3} style={{ marginTop: 24, marginBottom: 8 }}>
            Selamat Datang di RASN Chat
          </Title>

          <Text type="secondary" style={{ textAlign: "center", maxWidth: 400 }}>
            Platform komunikasi tim terintegrasi dengan Kanban dan Email. Pilih
            channel di sidebar atau buat channel baru.
          </Text>

          <Button
            type="primary"
            icon={<IconPlus size={14} />}
            onClick={() => setCreateModalOpen(true)}
            style={{ marginTop: 24 }}
          >
            Buat Channel Baru
          </Button>

          {stats && (
            <Text type="secondary" style={{ marginTop: 16, fontSize: 12 }}>
              {stats.channels || 0} channel • {stats.messages || 0} pesan •{" "}
              {stats.members || 0} member
            </Text>
          )}
        </div>
      </PageContainer>

      <CreateChannelModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
}

RasnChatIndex.getLayout = function getLayout(page) {
  return <ChatLayout>{page}</ChatLayout>;
};

RasnChatIndex.Auth = {
  action: "manage",
  subject: "tickets",
};

export default RasnChatIndex;

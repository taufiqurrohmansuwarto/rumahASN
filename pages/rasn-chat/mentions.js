import Head from "next/head";
import { Button, Typography, Badge, Space } from "antd";
import ChatLayout from "@/components/ChatLayout";
import { MentionList } from "@/components/RasnChat";
import { useMarkAllMentionsAsRead, useMentionCount } from "@/hooks/useRasnChat";

const { Title, Text } = Typography;

function MentionsPage() {
  const { data: mentionData } = useMentionCount();
  const markAllAsRead = useMarkAllMentionsAsRead();
  const unreadCount = mentionData?.count || 0;

  return (
    <>
      <Head>
        <title>Mentions - RASN Chat | Rumah ASN</title>
      </Head>

      <div style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              Mentions
            </Title>
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ backgroundColor: "#52c41a" }} />
            )}
          </Space>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={() => markAllAsRead.mutate()}
              loading={markAllAsRead.isLoading}
            >
              Tandai Semua Dibaca
            </Button>
          )}
        </div>

        <MentionList />
      </div>
    </>
  );
}

MentionsPage.getLayout = function getLayout(page) {
  return <ChatLayout>{page}</ChatLayout>;
};

MentionsPage.Auth = {
  action: "manage",
  subject: "tickets",
};

export default MentionsPage;

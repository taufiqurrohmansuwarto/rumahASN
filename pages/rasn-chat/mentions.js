import Head from "next/head";
import { Button, Typography } from "antd";
import ChatLayout from "@/components/ChatLayout";
import { MentionList } from "@/components/RasnChat";
import { useMarkAllMentionsAsRead, useMentionCount } from "@/hooks/useRasnChat";

const { Title } = Typography;

function MentionsPage() {
  const { data: mentionData } = useMentionCount();
  const markAllAsRead = useMarkAllMentionsAsRead();

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
          <Title level={4} style={{ margin: 0 }}>
            Mentions ({mentionData?.count || 0})
          </Title>
          {mentionData?.count > 0 && (
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

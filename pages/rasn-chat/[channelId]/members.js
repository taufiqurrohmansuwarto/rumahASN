import { useRouter } from "next/router";
import Head from "next/head";
import { Button, Typography } from "antd";
import { IconArrowLeft } from "@tabler/icons-react";
import ChatLayout from "@/components/ChatLayout";
import { ChannelMembers } from "@/components/RasnChat";
import { useChannel } from "@/hooks/useRasnChat";

const { Title } = Typography;

function ChannelMembersPage() {
  const router = useRouter();
  const { channelId } = router.query;

  const { data: channel } = useChannel(channelId);

  return (
    <>
      <Head>
        <title>Member - {channel?.name || "RASN Chat"} | Rumah ASN</title>
      </Head>

      <div style={{ padding: 24 }}>
        <Button
          type="text"
          icon={<IconArrowLeft size={16} />}
          onClick={() => router.push(`/rasn-chat/${channelId}`)}
          style={{ marginBottom: 16 }}
        >
          Kembali ke Chat
        </Button>

        <Title level={4} style={{ marginBottom: 16 }}>
          Member Channel - #{channel?.name}
        </Title>

        <ChannelMembers channelId={channelId} />
      </div>
    </>
  );
}

ChannelMembersPage.getLayout = function getLayout(page) {
  return <ChatLayout>{page}</ChatLayout>;
};

ChannelMembersPage.Auth = {
  action: "manage",
  subject: "tickets",
};

export default ChannelMembersPage;

import ChatLayout from "@/components/ChatLayout";
import PageContainer from "@/components/PageContainer";
import { ChannelMembers } from "@/components/RasnChat";
import { useChannel } from "@/hooks/useRasnChat";
import { Typography } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

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

      <PageContainer
        title={`Member Channel - #${channel?.name || ""}`}
        onBack={() => router.push(`/rasn-chat/${channelId}`)}
      >
        <ChannelMembers channelId={channelId} />
      </PageContainer>
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

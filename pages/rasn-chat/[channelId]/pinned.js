import ChatLayout from "@/components/ChatLayout";
import PageContainer from "@/components/PageContainer";
import { PinnedMessages } from "@/components/RasnChat";
import { useChannel } from "@/hooks/useRasnChat";
import Head from "next/head";
import { useRouter } from "next/router";

function ChannelPinnedPage() {
  const router = useRouter();
  const { channelId } = router.query;

  const { data: channel } = useChannel(channelId);

  return (
    <>
      <Head>
        <title>Pesan Dipin - {channel?.name || "RASN Chat"} | Rumah ASN</title>
      </Head>

      <PageContainer
        title={`Pesan yang Di-pin - #${channel?.name || ""}`}
        onBack={() => router.push(`/rasn-chat/${channelId}`)}
      >
        <PinnedMessages channelId={channelId} />
      </PageContainer>
    </>
  );
}

ChannelPinnedPage.getLayout = function getLayout(page) {
  return <ChatLayout>{page}</ChatLayout>;
};

ChannelPinnedPage.Auth = {
  action: "manage",
  subject: "tickets",
};

export default ChannelPinnedPage;

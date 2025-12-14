import ChatLayout from "@/components/ChatLayout";
import PageContainer from "@/components/PageContainer";
import { MediaGallery } from "@/components/RasnChat";
import { useChannel } from "@/hooks/useRasnChat";
import { Typography } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const { Title } = Typography;

function ChannelMediaPage() {
  const router = useRouter();
  const { channelId } = router.query;

  const { data: channel } = useChannel(channelId);

  return (
    <>
      <Head>
        <title>
          Media Gallery - {channel?.name || "RASN Chat"} | Rumah ASN
        </title>
      </Head>

      <PageContainer
        title={`Media & File - #${channel?.name || ""}`}
        onBack={() => router.push(`/rasn-chat/${channelId}`)}
      >
        <MediaGallery channelId={channelId} />
      </PageContainer>
    </>
  );
}

ChannelMediaPage.getLayout = function getLayout(page) {
  return <ChatLayout>{page}</ChatLayout>;
};

ChannelMediaPage.Auth = {
  action: "manage",
  subject: "tickets",
};

export default ChannelMediaPage;

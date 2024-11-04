import ChatApp from "@/components/ChatAI/BotAssistants/ChatApp";
import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Flex, Spin } from "antd";
import Head from "next/head";

const AsnUpdates = () => {
  useScrollRestoration();
  const router = useRouter();
  const { assistantId, id: threadId } = router.query;

  if (!assistantId || !threadId) {
    return (
      <Flex align="center" justify="center" style={{ height: "100vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  // create link whatssapmessage

  return (
    <>
      <Head>
        <title>Rumah ASN - Smart ASN Connect Update</title>
      </Head>
      <LayoutASNConnect active="asn-ai-chat">
        <ChatApp initialAssistantId={assistantId} initialThreadId={threadId} />
      </LayoutASNConnect>
    </>
  );
};

AsnUpdates.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnUpdates.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnUpdates;

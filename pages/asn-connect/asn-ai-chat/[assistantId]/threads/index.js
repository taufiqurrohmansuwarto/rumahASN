import ChatApp from "@/components/ChatAI/BotAssistants/ChatApp";
import BotAssistantsLayout from "@/components/ChatAI/BotAssistantsLayout";
import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import Head from "next/head";

const AsnUpdates = () => {
  useScrollRestoration();

  // create link whatssapmessage

  return (
    <>
      <Head>
        <title>Rumah ASN - Smart ASN Connect Update</title>
      </Head>
      <LayoutASNConnect active="asn-ai-chat">
        <ChatApp height={600} />
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

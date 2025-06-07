import Layout from "@/components/Layout";
import FloatChatButton from "@/components/Socmed/FloatChatButton";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import SocmedTabs from "@/components/Socmed/SocmedTabs";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import Head from "next/head";
import { useRouter } from "next/router";

const AsnUpdates = () => {
  useScrollRestoration();
  const router = useRouter();

  const gotoChatBot = () => {
    router.push("/chat-ai");
  };

  // create link whatssapmessage

  return (
    <>
      <Head>
        <title>Rumah ASN - Smart ASN Connect Update</title>
      </Head>
      <LayoutASNConnect>
        {/* <ModalUserAnomali /> */}
        <SocmedTabs />
        <FloatChatButton onClick={gotoChatBot} />
        {/* <EletterBKD /> */}
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

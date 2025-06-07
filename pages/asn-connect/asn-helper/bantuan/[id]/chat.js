import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";

const AsnHelperBantuanChat = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Helper - Bantuan Chat</title>
      </Head>
      <LayoutASNConnect active="asn-helper">Hello world</LayoutASNConnect>
    </>
  );
};

AsnHelperBantuanChat.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnHelperBantuanChat.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-helper">{page}</Layout>;
};

export default AsnHelperBantuanChat;

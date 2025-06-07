import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";

const AsnHelperLeaderboard = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Helper - Leaderboard</title>
      </Head>
      <LayoutASNConnect active="asn-helper">Hello world</LayoutASNConnect>
    </>
  );
};

AsnHelperLeaderboard.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnHelperLeaderboard.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-helper">{page}</Layout>;
};

export default AsnHelperLeaderboard;

import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";
import Discussions from "@/components/Discussions/Discussions";

const AsnDiscussions = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Update</title>
      </Head>
      <LayoutASNConnect active="asn-discussions">
        <Discussions />
      </LayoutASNConnect>
    </>
  );
};

AsnDiscussions.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnDiscussions.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnDiscussions;

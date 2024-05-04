import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";

const ASNStoryLines = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Update</title>
      </Head>
      <LayoutASNConnect active="asn-communities">Hello world</LayoutASNConnect>
    </>
  );
};

ASNStoryLines.Auth = {
  action: "manage",
  subject: "tickets",
};

ASNStoryLines.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default ASNStoryLines;

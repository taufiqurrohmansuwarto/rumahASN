import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";

const AsnCommunities = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Update</title>
      </Head>
      <LayoutASNConnect active="asn-communities">Hello world</LayoutASNConnect>
    </>
  );
};

AsnCommunities.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnCommunities.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnCommunities;

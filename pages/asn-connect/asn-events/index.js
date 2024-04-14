import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";

const AsnEvents = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Update</title>
      </Head>
      <LayoutASNConnect active="asn-events">Hello world</LayoutASNConnect>
    </>
  );
};

AsnEvents.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnEvents.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-events">{page}</Layout>;
};

export default AsnEvents;

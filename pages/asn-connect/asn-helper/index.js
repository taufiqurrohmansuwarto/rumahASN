import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";

const AsnHelper = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Helper</title>
      </Head>
      <LayoutASNConnect active="asn-helper">Hello world</LayoutASNConnect>
    </>
  );
};

AsnHelper.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnHelper.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-helper">{page}</Layout>;
};

export default AsnHelper;

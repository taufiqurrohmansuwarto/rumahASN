import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";

const AsnHelperSaya = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Helper - Bantuan Saya</title>
      </Head>
      <LayoutASNConnect active="asn-helper">Hello world</LayoutASNConnect>
    </>
  );
};

AsnHelperSaya.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnHelperSaya.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-helper">{page}</Layout>;
};

export default AsnHelperSaya;

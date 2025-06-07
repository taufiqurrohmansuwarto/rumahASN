import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";

const AsnHelperBeri = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Helper - Beri Bantuan</title>
      </Head>
      <LayoutASNConnect active="asn-helper">Hello world</LayoutASNConnect>
    </>
  );
};

AsnHelperBeri.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnHelperBeri.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-helper">{page}</Layout>;
};

export default AsnHelperBeri;

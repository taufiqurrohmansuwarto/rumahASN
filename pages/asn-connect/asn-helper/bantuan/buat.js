import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";

const AsnHelperCreate = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Helper - Buat Bantuan</title>
      </Head>
      <LayoutASNConnect active="asn-helper">Hello world</LayoutASNConnect>
    </>
  );
};

AsnHelperCreate.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnHelperCreate.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-helper">{page}</Layout>;
};

export default AsnHelperCreate;

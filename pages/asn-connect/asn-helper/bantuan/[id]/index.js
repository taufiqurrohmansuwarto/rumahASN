import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";

const AsnHelperBantuanDetail = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Helper - Bantuan Detail</title>
      </Head>
      <LayoutASNConnect active="asn-helper">Hello world</LayoutASNConnect>
    </>
  );
};

AsnHelperBantuanDetail.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnHelperBantuanDetail.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-helper">{page}</Layout>;
};

export default AsnHelperBantuanDetail;

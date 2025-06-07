import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";

const AsnHelperBantuanSelesai = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Helper - Bantuan Selesai</title>
      </Head>
      <LayoutASNConnect active="asn-helper">Hello world</LayoutASNConnect>
    </>
  );
};

AsnHelperBantuanSelesai.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnHelperBantuanSelesai.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-helper">{page}</Layout>;
};

export default AsnHelperBantuanSelesai;

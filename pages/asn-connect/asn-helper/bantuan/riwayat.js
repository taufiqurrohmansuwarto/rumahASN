import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";

const AsnHelperRiwayat = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Helper - Riwayat Bantuan</title>
      </Head>
      <LayoutASNConnect active="asn-helper">Hello world</LayoutASNConnect>
    </>
  );
};

AsnHelperRiwayat.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnHelperRiwayat.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-helper">{page}</Layout>;
};

export default AsnHelperRiwayat;

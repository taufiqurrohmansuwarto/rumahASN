import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";

const AsnHelperProfile = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Helper - Profile</title>
      </Head>
      <LayoutASNConnect active="asn-helper">Hello world</LayoutASNConnect>
    </>
  );
};

AsnHelperProfile.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnHelperProfile.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-helper">{page}</Layout>;
};

export default AsnHelperProfile;

import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";

const AsnHelperDashboard = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Helper - Dashboard</title>
      </Head>
      <LayoutASNConnect active="asn-helper">Hello world</LayoutASNConnect>
    </>
  );
};

AsnHelperDashboard.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnHelperDashboard.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-helper">{page}</Layout>;
};

export default AsnHelperDashboard;

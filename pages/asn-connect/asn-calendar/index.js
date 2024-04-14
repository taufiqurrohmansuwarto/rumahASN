import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";

const AsnCalendar = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Update</title>
      </Head>
      <LayoutASNConnect active="asn-calendar">Hello world</LayoutASNConnect>
    </>
  );
};

AsnCalendar.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnCalendar.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-calendar">{page}</Layout>;
};

export default AsnCalendar;

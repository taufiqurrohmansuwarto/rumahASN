import LayoutEvent from "@/components/Events/LayoutEvent";
import Layout from "@/components/Layout";
import Head from "next/head";

const ASNConnectEventDetail = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Connect - Event</title>
      </Head>
      <LayoutEvent></LayoutEvent>
    </>
  );
};

ASNConnectEventDetail.getLayout = function getLayout(page) {
  return <Layout active="/fasilitator/smart-asn-connect/events">{page}</Layout>;
};

ASNConnectEventDetail.Auth = {
  action: "manage",
  subject: "Feeds",
};

export default ASNConnectEventDetail;

import EventSpeakers from "@/components/Events/EventSpeakers";
import LayoutEvent from "@/components/Events/LayoutEvent";
import Layout from "@/components/Layout";
import Head from "next/head";

const ASNConnectEventSpeakers = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Connect - Event</title>
      </Head>
      <LayoutEvent tabActiveKey="speakers">
        <EventSpeakers />
      </LayoutEvent>
    </>
  );
};

ASNConnectEventSpeakers.getLayout = function getLayout(page) {
  return <Layout active="/fasilitator/smart-asn-connect/events">{page}</Layout>;
};

ASNConnectEventSpeakers.Auth = {
  action: "manage",
  subject: "Feeds",
};

export default ASNConnectEventSpeakers;

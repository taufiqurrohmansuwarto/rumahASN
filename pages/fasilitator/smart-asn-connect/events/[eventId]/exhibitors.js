import EventExhibitors from "@/components/Events/EventExhibitors";
import LayoutEvent from "@/components/Events/LayoutEvent";
import Layout from "@/components/Layout";
import Head from "next/head";

const ASNConnectEventMaps = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Connect - Event</title>
      </Head>
      <LayoutEvent tabActiveKey="exhibitors">
        <EventExhibitors />
      </LayoutEvent>
    </>
  );
};

ASNConnectEventMaps.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

ASNConnectEventMaps.Auth = {
  action: "manage",
  subject: "Feeds",
};

export default ASNConnectEventMaps;

import AdminEvents from "@/components/Events/AdminEvents";
import EventMaps from "@/components/Events/EventMaps";
import LayoutEvent from "@/components/Events/LayoutEvent";
import Layout from "@/components/Layout";
import { PageContainer } from "@ant-design/pro-layout";
import Head from "next/head";

const ASNConnectEventMaps = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Connect - Event</title>
      </Head>
      <LayoutEvent tabActiveKey="maps">
        <EventMaps />
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

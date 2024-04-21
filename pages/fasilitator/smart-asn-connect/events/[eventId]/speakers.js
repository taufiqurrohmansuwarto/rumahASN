import AdminEvents from "@/components/Events/AdminEvents";
import Layout from "@/components/Layout";
import { PageContainer } from "@ant-design/pro-layout";
import Head from "next/head";

const ASNConnectEventSpeakers = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Connect - Event</title>
      </Head>
    </>
  );
};

ASNConnectEventSpeakers.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

ASNConnectEventSpeakers.Auth = {
  action: "manage",
  subject: "Feeds",
};

export default ASNConnectEventSpeakers;

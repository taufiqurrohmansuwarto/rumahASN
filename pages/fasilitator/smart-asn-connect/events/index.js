import AdminEvents from "@/components/Events/AdminEvents";
import Layout from "@/components/Layout";
import { PageContainer } from "@ant-design/pro-layout";
import Head from "next/head";

const ASNConnectEvent = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Connect</title>
      </Head>
      <PageContainer title="ASN Connect" content="Event ASN Connect" />
      <AdminEvents />
    </>
  );
};

ASNConnectEvent.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

ASNConnectEvent.Auth = {
  action: "manage",
  subject: "Feeds",
};

export default ASNConnectEvent;

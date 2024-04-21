import AdminEvents from "@/components/Events/AdminEvents";
import Layout from "@/components/Layout";
import { PageContainer } from "@ant-design/pro-layout";
import Head from "next/head";

const ASNConnectEventParticipants = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Connect - Event</title>
      </Head>
    </>
  );
};

ASNConnectEventParticipants.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

ASNConnectEventParticipants.Auth = {
  action: "manage",
  subject: "Feeds",
};

export default ASNConnectEventParticipants;

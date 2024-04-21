import AdminEvents from "@/components/Events/AdminEvents";
import Layout from "@/components/Layout";
import { PageContainer } from "@ant-design/pro-layout";
import Head from "next/head";

const ASNConnectEventSponsors = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Connect - Event</title>
      </Head>
    </>
  );
};

ASNConnectEventSponsors.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

ASNConnectEventSponsors.Auth = {
  action: "manage",
  subject: "Feeds",
};

export default ASNConnectEventSponsors;

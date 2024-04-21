import CreateEvent from "@/components/Events/CreateEvent";
import Layout from "@/components/Layout";
import { PageContainer } from "@ant-design/pro-layout";
import Head from "next/head";

const ASNConnectCreateEvent = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Connect</title>
      </Head>
      <PageContainer title="Buat Kegiatan" content="Buat Kegiatan" />
      <CreateEvent />
    </>
  );
};

ASNConnectCreateEvent.getLayout = function getLayout(page) {
  return <Layout active="/fasilitator/smart-asn-connect/events">{page}</Layout>;
};

ASNConnectCreateEvent.Auth = {
  action: "manage",
  subject: "Feeds",
};

export default ASNConnectCreateEvent;

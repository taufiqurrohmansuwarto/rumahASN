import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import SIASNTracking from "@/components/Tracking/SIASNTracking";
import { Stack } from "@mantine/core";
import { Alert, Card } from "antd";
import Head from "next/head";

function TrackingSIASN() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Tracking SIASN</title>
      </Head>
      <PageContainer title="Layanan Tracking" subTitle="Aplikasi SIASN">
        <Card>
          <SIASNTracking />
        </Card>
      </PageContainer>
    </>
  );
}

TrackingSIASN.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

TrackingSIASN.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default TrackingSIASN;

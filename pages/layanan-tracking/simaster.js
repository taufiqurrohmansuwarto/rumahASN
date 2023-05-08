import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import SIMASTERTracking from "@/components/Tracking/SIMASTERTracking";
import { Card } from "antd";
import Head from "next/head";

function TrackingSIMASTER() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Tracking SIMASTER</title>
      </Head>
      <PageContainer title="Layanan Tracking" subTitle="Aplikasi SIMASTER">
        <Card>
          <SIMASTERTracking />
        </Card>
      </PageContainer>
    </>
  );
}

TrackingSIMASTER.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

TrackingSIMASTER.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default TrackingSIMASTER;

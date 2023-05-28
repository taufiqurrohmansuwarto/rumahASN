import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import IpASN from "@/components/Tracking/IpASN";
import SIASNTracking from "@/components/Tracking/SIASNTracking";
import { Card, Col, Divider, Row } from "antd";
import Head from "next/head";

function TrackingSIASN() {
  return (
    <>
      <Head>
        <title>Tracking SIASN</title>
      </Head>
      <PageContainer title="Layanan Tracking" subTitle="Aplikasi SIASN">
        <Row gutter={[8, 16]}>
          <Col span={24}>
            <Card title="Layanan Tracking">
              <SIASNTracking />
            </Card>
          </Col>
          <Col span={24}>
            <Card title="Cek IP ASN">
              <IpASN />
            </Card>
          </Col>
        </Row>
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

import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { MenuMySAPK } from "@/components/PemutakhiranData/MenuMySAPK";
import SIASNTracking from "@/components/Tracking/SIASNTracking";
import WithAuth from "@/components/hoc/WithAuth";
import { Card, Col, Row } from "antd";
import Head from "next/head";
import React from "react";

const StatusTrackingSIASN = WithAuth(SIASNTracking, ["MASTER"]);

function Komparasi() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan - Komparasi</title>
      </Head>
      <PageContainer
        title="Komparasi"
        subTitle="Komparasi Data"
        content="Peremajaan Data SIASN dan SIMASTER"
      >
        <Card>
          <Row
            gutter={{
              xs: 20,
              sm: 20,
              md: 24,
              lg: 32,
            }}
          >
            <Col md={12} xs={24}>
              <MenuMySAPK />
            </Col>
            <Col md={12} xs={24}>
              <StatusTrackingSIASN />
            </Col>
          </Row>
        </Card>
      </PageContainer>
    </>
  );
}

Komparasi.Auth = {
  action: "manage",
  subject: "Tickets",
};

Komparasi.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/data-utama">{page}</Layout>;
};

export default Komparasi;

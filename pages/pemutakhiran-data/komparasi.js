import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { MenuMySAPK } from "@/components/PemutakhiranData/MenuMySAPK";
import { Col, Row } from "antd";
import Head from "next/head";
import React from "react";

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
        <Row
          gutter={{
            xs: 8,
            sm: 16,
            md: 24,
            lg: 32,
          }}
        >
          <Col md={12} xs={24}>
            <MenuMySAPK />
          </Col>
          <Col>
            <div>hello world</div>
          </Col>
        </Row>
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

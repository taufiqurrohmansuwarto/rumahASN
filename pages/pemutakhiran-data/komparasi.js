import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { MenuMySAPK } from "@/components/PemutakhiranData/MenuMySAPK";
import SIASNTracking from "@/components/Tracking/SIASNTracking";
import { Card, Col, Row } from "antd";
import { useSession } from "next-auth/react";
import Head from "next/head";

function Komparasi() {
  const { data } = useSession();

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan - Komparasi</title>
      </Head>
      <PageContainer
        title="Integrasi SIASN dan SIMASTER"
        // subTitle="Komparasi Data"
        content="Layanan Komparasi Data SIASN dan SIMASTER"
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
              {data?.user?.group === "MASTER" && <SIASNTracking />}
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
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default Komparasi;

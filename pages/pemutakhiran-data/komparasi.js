import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { MenuMySAPK } from "@/components/PemutakhiranData/MenuMySAPK";
import SIASNTracking from "@/components/Tracking/SIASNTracking";
import { dataUtamaSIASN } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card, Col, Row } from "antd";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

// base64 to image

function Komparasi() {
  const { data } = useSession();

  const { data: dataUtama, isLoading } = useQuery(
    ["data-utama-siasn"],
    () => dataUtamaSIASN(),
    {}
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan - Komparasi</title>
      </Head>
      <PageContainer
        title="Integrasi SIASN dan SIMASTER"
        content="Layanan Komparasi Data SIASN dan SIMASTER"
        loading={isLoading}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                Integrasi Data SIASN dan SIMASTER
              </Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Card>
          <Row gutter={[16, 16]}>
            <Col md={12} xs={24}>
              <MenuMySAPK dataUtama={dataUtama} />
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

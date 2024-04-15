import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { MenuMySAPK } from "@/components/PemutakhiranData/MenuMySAPK";
import { dataUtamaSIASN } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Col, Row } from "antd";
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
        <title>Rumah ASN - Integrasi - MyASN dan SIMASTER</title>
      </Head>
      <PageContainer
        title="Integrasi MyASN dan SIMASTER"
        content="Layanan Komparasi Data MyASN dan SIMASTER"
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
                Integrasi Data MyASN dan SIMASTER
              </Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Row gutter={[16, 16]}>
          <Col md={16} xs={24}>
            <MenuMySAPK dataUtama={dataUtama} />
          </Col>
          {/* <Col md={12} xs={24}>
              {data?.user?.group === "MASTER" && <SIASNTracking />}
            </Col> */}
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
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default Komparasi;

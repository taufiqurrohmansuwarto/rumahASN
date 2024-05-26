import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { MenuMySAPK } from "@/components/PemutakhiranData/MenuMySAPK";
import { dataUtamaSIASN } from "@/services/siasn-services";
import { Center } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Col, Empty, Row } from "antd";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

// base64 to image

function Komparasi() {
  const {
    data: dataUtama,
    isLoading,
    error,
  } = useQuery(["data-utama-siasn"], () => dataUtamaSIASN(), {});

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
            {dataUtama ? (
              <MenuMySAPK dataUtama={dataUtama} />
            ) : (
              <Center>
                <Empty
                  description={
                    <span>
                      Oops! Data pegawai tidak ditemukan atau masih dalam proses
                      pengentrian di SIASN.
                    </span>
                  }
                />
              </Center>
            )}
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

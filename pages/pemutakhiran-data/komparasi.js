import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { MenuMySAPK } from "@/components/PemutakhiranData/MenuMySAPK";
import { dataUtamaSimaster } from "@/services/master.services";
import {
  dataNilaiIPASN,
  dataUtamaSIASN,
  fotoSiasn,
} from "@/services/siasn-services";
import { Center } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Col,
  Empty,
  Grid,
  Modal,
  Row,
  Skeleton,
} from "antd";
import Head from "next/head";
import Link from "next/link";

// base64 to image

const useDataUtamaMaster = () => {
  const { data, isLoading, refetch, isFetching } = useQuery(
    ["data-utama-simaster"],
    () => dataUtamaSimaster(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return { data, isLoading, refetch, isFetching };
};

function Komparasi() {
  const breakPoint = Grid.useBreakpoint();

  const { data: dataUtama, isLoading } = useQuery(
    ["data-utama-siasn"],
    () => dataUtamaSIASN(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: foto, isLoading: isLoadingFoto } = useQuery(
    ["foto-pns"],
    () => fotoSiasn(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: nilaiIPASN, isLoading: isLoadingNilaiIPASN } = useQuery(
    ["nilai-ipasn"],
    () => dataNilaiIPASN(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const showModal = () => {
    Modal.info({
      title: "Apa yang harus dilakukan?",
      content:
        "Jika anda merupakan PPPK baru, sembari menunggu proses masuk ke myASN bisa melengkapi dokumen pada aplikasi SIMASTER terlebih dahulu seperti foto, jabatan, sk pppk, pendidikan, dokumen pendukung dsb.",
    });
  };

  const { data: dataUtamaMaster, isLoading: isLoadingUtamaMaster } =
    useDataUtamaMaster();

  return (
    <>
      <Head>
        <title>Rumah ASN - Integrasi MyASN</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Integrasi MyASN"
        content="Layanan Komparasi Data SIASN dan SIMASTER"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Integrasi MyASN</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Row gutter={[16, 16]}>
          <Col md={16} xs={24}>
            <Skeleton loading={isLoading}>
              {dataUtama ? (
                <MenuMySAPK
                  simaster={dataUtamaMaster}
                  foto={foto}
                  dataUtama={dataUtama}
                />
              ) : (
                <Center>
                  <Empty
                    description={
                      <span>
                        Oops! Data pegawai tidak ditemukan atau data pegawai
                        masih pengentrian di SIASN.
                      </span>
                    }
                  >
                    <Button onClick={showModal} type="primary">
                      Apa yang harus dilakukan?
                    </Button>
                  </Empty>
                </Center>
              )}
            </Skeleton>
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

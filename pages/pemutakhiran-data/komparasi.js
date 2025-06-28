import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { MenuMySAPK } from "@/components/PemutakhiranData/MenuMySAPK";
import { dataUtamaSimaster } from "@/services/master.services";
import {
  dataNilaiIPASN,
  dataUtamaSIASN,
  fotoSiasn,
} from "@/services/siasn-services";
import {
  InfoCircleOutlined,
  LoadingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Flex,
  Grid,
  Modal,
  Row,
  Skeleton,
  Typography,
} from "antd";
import Head from "next/head";
import Link from "next/link";

const { Title, Text } = Typography;

// Loading Component
const LoadingSkeleton = () => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Card
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #EDEFF1",
        borderRadius: "8px",
        minHeight: "400px",
      }}
      bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
    >
      {/* Profile Section Loading */}
      <div style={{ marginBottom: "24px" }}>
        <Flex align="center" gap={16} vertical={isMobile}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              width: isMobile ? "100%" : "auto",
            }}
          >
            <Skeleton.Avatar size={isMobile ? 60 : 80} />
            <div style={{ flex: 1 }}>
              <Skeleton active paragraph={{ rows: 2 }} title={{ width: 200 }} />
            </div>
          </div>
          {!isMobile && (
            <div style={{ textAlign: "right" }}>
              <Skeleton.Button size="small" style={{ width: 120 }} />
            </div>
          )}
        </Flex>
      </div>

      {/* Menu Grid Loading */}
      <div>
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: 150 }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          {[...Array(8)].map((_, index) => (
            <Card
              key={index}
              size="small"
              style={{
                backgroundColor: "#F8F9FA",
                border: "1px solid #EDEFF1",
                borderRadius: "8px",
                height: isMobile ? "85px" : "100px",
              }}
              bodyStyle={{
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Skeleton.Avatar size="small" />
              <Skeleton active paragraph={false} title={{ width: 60 }} />
            </Card>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          color: "#787C7E",
          fontSize: "14px",
          gap: "8px",
        }}
      >
        <LoadingOutlined style={{ fontSize: "16px", color: "#1890FF" }} />
        <Text style={{ color: "#787C7E" }}>Memuat data MyASN...</Text>
      </div>
    </Card>
  );
};

// Enhanced Empty State Component
const EnhancedEmpty = ({ showModal }) => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Card
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #EDEFF1",
        borderRadius: "8px",
        minHeight: "400px",
      }}
      bodyStyle={{
        padding: isMobile ? "24px 16px" : "48px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#F8F9FA",
          borderRadius: "50%",
          width: isMobile ? "80px" : "100px",
          height: isMobile ? "80px" : "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <UserOutlined
          style={{
            fontSize: isMobile ? "32px" : "40px",
            color: "#787C7E",
          }}
        />
      </div>

      <Title
        level={4}
        style={{
          color: "#1A1A1B",
          marginBottom: "8px",
          fontSize: isMobile ? "18px" : "20px",
        }}
      >
        🔍 Data Pegawai Tidak Ditemukan
      </Title>

      <Text
        style={{
          color: "#787C7E",
          marginBottom: "24px",
          fontSize: isMobile ? "14px" : "16px",
          lineHeight: "1.5",
          maxWidth: "400px",
        }}
      >
        Data pegawai tidak ditemukan atau data pegawai masih dalam proses
        penginputan di sistem SIASN.
      </Text>

      <Button
        type="primary"
        icon={<InfoCircleOutlined />}
        onClick={showModal}
        size={isMobile ? "middle" : "large"}
        style={{
          backgroundColor: "#FF4500",
          borderColor: "#FF4500",
          borderRadius: "6px",
          fontWeight: 500,
          height: isMobile ? "40px" : "44px",
          padding: isMobile ? "0 16px" : "0 24px",
        }}
      >
        Apa yang harus dilakukan?
      </Button>
    </Card>
  );
};

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
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const {
    data: dataUtama,
    isLoading,
    refetch: refetchDataUtama,
    isFetching: isFetchingDataUtama,
  } = useQuery(["data-utama-siasn"], () => dataUtamaSIASN(), {
    refetchOnWindowFocus: false,
  });

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
      title: "💡 Apa yang harus dilakukan?",
      content: (
        <div
          style={{
            lineHeight: "1.6",
            color: "#1A1A1B",
            fontSize: "14px",
          }}
        >
          <p style={{ marginBottom: "12px" }}>
            🆕 <strong>Jika Anda merupakan PPPK baru:</strong>
          </p>
          <p style={{ marginBottom: "8px", paddingLeft: "16px" }}>
            Sembari menunggu proses masuk ke MyASN, Anda bisa melengkapi dokumen
            pada aplikasi SIMASTER terlebih dahulu seperti:
          </p>
          <ul
            style={{
              marginLeft: "16px",
              marginBottom: "0",
              color: "#787C7E",
            }}
          >
            <li>📸 Foto profil</li>
            <li>💼 Data jabatan</li>
            <li>📄 SK PPPK</li>
            <li>🎓 Data pendidikan</li>
            <li>📋 Dokumen pendukung lainnya</li>
          </ul>
        </div>
      ),
      width: 500,
      okText: "Mengerti",
      okButtonProps: {
        style: {
          backgroundColor: "#FF4500",
          borderColor: "#FF4500",
        },
      },
    });
  };

  const {
    data: dataUtamaMaster,
    isLoading: isLoadingUtamaMaster,
    refetch: refetchDataUtamaMaster,
    isFetching: isFetchingDataUtamaMaster,
  } = useDataUtamaMaster();

  // Check if any data is loading
  const isAnyLoading = isLoading || isLoadingFoto || isLoadingUtamaMaster;

  return (
    <>
      <Head>
        <title>Rumah ASN - Integrasi MyASN</title>
      </Head>
      <div>
        <PageContainer
          childrenContentStyle={{
            padding: screens.xs ? 0 : null,
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
          <div>
            <Row gutter={[16, 16]}>
              <Col md={24} xs={24} sm={24}>
                {isAnyLoading ? (
                  <LoadingSkeleton />
                ) : dataUtama ? (
                  <MenuMySAPK
                    loadingDataUtamaSiasn={isLoading || isFetchingDataUtama}
                    loadingDataUtamaMaster={
                      isLoadingUtamaMaster || isFetchingDataUtamaMaster
                    }
                    refetchDataUtamaSiasn={refetchDataUtama}
                    refetchDataUtamaMaster={refetchDataUtamaMaster}
                    simaster={dataUtamaMaster}
                    foto={foto}
                    dataUtama={dataUtama}
                  />
                ) : (
                  <EnhancedEmpty showModal={showModal} />
                )}
              </Col>
            </Row>
          </div>
        </PageContainer>
      </div>

      <style jsx global>{`
        .ant-pro-page-container-children-content {
          background-color: transparent !important;
        }

        .ant-modal-header {
          background-color: #f8f9fa !important;
          border-bottom: 1px solid #edeff1 !important;
        }

        .ant-modal-title {
          color: #1a1a1b !important;
          font-weight: 600 !important;
        }

        .ant-modal-content {
          border-radius: 8px !important;
        }
      `}</style>
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

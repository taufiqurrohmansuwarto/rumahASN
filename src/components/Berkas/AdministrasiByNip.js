import {
  checkDocumentByNip,
  downloadDocumentByNip,
} from "@/services/master.services";
import {
  CloudDownloadOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  CalendarOutlined,
  FileTextOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Alert,
  Divider,
  Tooltip,
  Grid,
  message,
} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

// Data TMT dengan keterangan yang lebih jelas
const list_tmt = [
  { value: "01042024", label: "1 April 2024" },
  { value: "01052024", label: "1 Mei 2024" },
  { value: "01062024", label: "1 Juni 2024" },
  { value: "01072024", label: "1 Juli 2024" },
  { value: "01082024", label: "1 Agustus 2024" },
  { value: "01012025", label: "1 Januari 2025" },
  { value: "01062025", label: "1 Juni 2025" },
  { value: "01072025", label: "1 Juli 2025" },
  { value: "01032025", label: "1 Maret 2025" },
];

// Data dokumen dengan keterangan yang lebih jelas
const dokumen = [
  { code: "SK", name: "Surat Keputusan", icon: <FileTextOutlined /> },
  { code: "PERTEK", name: "Pertimbangan Teknis", icon: <FileTextOutlined /> },
  {
    code: "SPMT",
    name: "Surat Pernyataan Melaksanakan Tugas",
    icon: <FileTextOutlined />,
  },
  { code: "PK", name: "Perjanjian Kinerja (PPPK)", icon: <FileTextOutlined /> },
];

const DocumentButton = ({ tmt, file, nip, fileName, icon }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { data, isLoading, error } = useQuery(
    ["check-document", `${tmt}-${file.code}`],
    () => checkDocumentByNip({ tmt: tmt, file: file.code, nip }),
    {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  const [downloading, setDownloading] = useState(false);

  const downloadFile = async () => {
    try {
      setDownloading(true);
      message.loading({
        content: `Mengunduh ${file.name}...`,
        key: "download",
      });

      const result = await downloadDocumentByNip({
        tmt: tmt,
        file: file.code,
        nip,
      });

      if (result) {
        const url = `data:application/pdf;base64,${result}`;
        const link = document.createElement("a");
        link.href = url;
        link.download = `${file.code}_${tmt}.pdf`;
        link.click();
        message.success({
          content: `${file.name} berhasil diunduh`,
          key: "download",
        });
      } else {
        message.error({
          content: `Gagal mengunduh ${file.name}`,
          key: "download",
        });
      }
    } catch (error) {
      message.error({
        content: `Gagal mengunduh ${file.name}. Silakan coba lagi.`,
        key: "download",
      });
    } finally {
      setDownloading(false);
    }
  };

  // Status dokumen
  const getDocumentStatus = () => {
    if (isLoading)
      return { status: "loading", color: "blue", text: "Memeriksa..." };
    if (error) return { status: "error", color: "red", text: "Error" };
    if (data) return { status: "available", color: "green", text: "Tersedia" };
    return { status: "unavailable", color: "red", text: "Tidak Tersedia" };
  };

  const statusInfo = getDocumentStatus();

  return (
    <Card
      size="small"
      hoverable={data && !downloading}
      className="document-card"
      style={{
        marginBottom: 8,
        borderColor: statusInfo.color === "green" ? "#52c41a" : "#f0f0f0",
      }}
    >
      <Row align="middle" gutter={[8, 8]}>
        <Col flex="24px">{icon}</Col>
        <Col flex="auto">
          <Space direction="vertical" size={0}>
            <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
              {file.name}
            </Text>
            <Tag
              color={statusInfo.color}
              icon={
                statusInfo.status === "loading" ? (
                  <LoadingOutlined spin />
                ) : statusInfo.status === "available" ? (
                  <CheckCircleOutlined />
                ) : statusInfo.status === "error" ? (
                  <WarningOutlined />
                ) : (
                  <CloseCircleOutlined />
                )
              }
              style={{ fontSize: isMobile ? 10 : 12 }}
            >
              {statusInfo.text}
            </Tag>
          </Space>
        </Col>
        <Col>
          <Tooltip
            title={data ? `Unduh ${file.name}` : "Dokumen tidak tersedia"}
          >
            <Button
              type={data ? "primary" : "default"}
              size={isMobile ? "small" : "middle"}
              icon={
                downloading ? (
                  <LoadingOutlined spin />
                ) : (
                  <CloudDownloadOutlined />
                )
              }
              onClick={downloadFile}
              disabled={!data || downloading}
              loading={downloading}
            >
              {!isMobile && "Unduh"}
            </Button>
          </Tooltip>
        </Col>
      </Row>
    </Card>
  );
};

const TMTSection = ({ tmtData, nip }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <Card
      title={
        <Space>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <Text strong style={{ color: "#1890ff" }}>
            PNS/PPPK TMT {tmtData.label}
          </Text>
        </Space>
      }
      style={{ marginBottom: 16 }}
      headStyle={{ backgroundColor: "#f8f9fa" }}
    >
      <Row gutter={[16, 8]}>
        {dokumen.map((dok) => (
          <Col
            key={`${tmtData.value}-${dok.code}`}
            xs={24}
            sm={12}
            md={8}
            lg={6}
          >
            <DocumentButton
              tmt={tmtData.value}
              file={dok}
              nip={nip}
              fileName={dok.name}
              icon={dok.icon}
            />
          </Col>
        ))}
      </Row>
    </Card>
  );
};

const downloadPk = async () => {
  try {
    message.loading({ content: "Membuka dokumen PK...", key: "pk" });
    const link = "https://siasn.bkd.jatimprov.go.id:9000/public/PK_2_7.pdf";
    window.open(link, "_blank");
    message.success({ content: "Dokumen PK berhasil dibuka", key: "pk" });
  } catch (error) {
    message.error({ content: "Gagal membuka dokumen PK", key: "pk" });
  }
};

function AdministrasiByNip() {
  const router = useRouter();
  const { nip } = router.query;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (!nip) {
    return (
      <Alert
        message="NIP tidak ditemukan"
        description="Silakan periksa kembali URL atau kembali ke halaman sebelumnya."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  return (
    <div style={{ padding: isMobile ? "16px 0" : "24px 0" }}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
              Dokumen Administrasi ASN
            </Title>
            <Text type="secondary">NIP: {nip}</Text>
          </Col>
          <Col>
            <Tooltip title="Unduh Template PK Halaman 2-7">
              <Button
                icon={<ExportOutlined />}
                type="default"
                onClick={downloadPk}
                size={isMobile ? "small" : "middle"}
              >
                {!isMobile && "Template PK"}
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </Card>

      {/* Info Panel */}
      <Alert
        message="Informasi"
        description="Klik tombol 'Unduh' untuk mengunduh dokumen. Pastikan koneksi internet stabil."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Dokumen Sections */}
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {list_tmt.map((tmtData) => (
          <TMTSection key={tmtData.value} tmtData={tmtData} nip={nip} />
        ))}
      </Space>
    </div>
  );
}

export default AdministrasiByNip;

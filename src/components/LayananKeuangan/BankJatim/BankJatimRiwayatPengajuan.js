import { historiesKredit } from "@/services/bankjatim.services";
import {
  BankOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  FilterOutlined,
  HistoryOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Grid,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Timeline,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

const BankJatimRiwayatPengajuan = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["bank-jatim-histories"],
    queryFn: () => historiesKredit(),
    refetchOnWindowFocus: false,
  });

  // Data riwayat pengajuan dari API
  const riwayatData = data?.data || [];

  // Status mapping
  const getStatusInfo = (status) => {
    const statusMap = {
      "A1 - REVIEW DOKUMEN": {
        color: "processing",
        icon: <ClockCircleOutlined />,
        text: "Review Dokumen",
        description: "Dokumen sedang dalam tahap review",
      },
      "A2 - DALAM PROSES": {
        color: "warning",
        icon: <ExclamationCircleOutlined />,
        text: "Dalam Proses",
        description: "Pengajuan sedang diproses",
      },
      "A3 - DISETUJUI": {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Disetujui",
        description: "Pengajuan telah disetujui",
      },
    };
    return statusMap[status] || statusMap["A1 - REVIEW DOKUMEN"];
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get product name
  const getProductName = (code) => {
    const products = {
      KMG: "Kredit Multiguna",
      KKB: "Kredit Kendaraan Bermotor",
      KPR: "Kredit Pemilikan Rumah",
    };
    return products[code] || code;
  };

  // Filter data
  const filteredData = riwayatData.filter((item) => {
    const matchSearch =
      item.no_pengajuan.toLowerCase().includes(searchText.toLowerCase()) ||
      item.jns_pinjaman.toLowerCase().includes(searchText.toLowerCase()) ||
      item.nama.toLowerCase().includes(searchText.toLowerCase());

    const matchStatus =
      statusFilter === "all" || item.status_pengajuan.includes(statusFilter);

    return matchSearch && matchStatus;
  });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Card
        style={{
          flex: 1,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 0, height: "100%" }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
            color: "white",
            padding: isMobile ? "20px 16px" : "24px 24px",
            textAlign: "center",
          }}
        >
          <HistoryOutlined style={{ fontSize: 32, marginBottom: 12 }} />
          <Title level={3} style={{ color: "white", margin: "0 0 8px 0" }}>
            Riwayat Pengajuan Kredit
          </Title>
          <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 16 }}>
            Pantau status dan riwayat pengajuan kredit Anda
          </Text>
        </div>

        {/* Filter Section */}
        <div
          style={{
            padding: isMobile ? 16 : 24,
            borderBottom: "1px solid #f0f0f0",
            background: "#fafbfc",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={16}>
              <Input
                placeholder="Cari berdasarkan nomor pengajuan, jenis kredit, atau nama"
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ borderRadius: 8 }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filter Status"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: "100%", borderRadius: 8 }}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Semua Status</Option>
                <Option value="A1">Review Dokumen</Option>
                <Option value="A2">Dalam Proses</Option>
                <Option value="A3">Disetujui</Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* Content */}
        <div
          style={{
            padding: isMobile ? 16 : 24,
            height: "calc(100% - 200px)",
            overflowY: "auto",
          }}
        >
          {isLoading ? (
            <div style={{ textAlign: "center", marginTop: 60 }}>
              <Text>Memuat data riwayat pengajuan...</Text>
            </div>
          ) : filteredData.length === 0 ? (
            <Empty
              description="Tidak ada data pengajuan ditemukan"
              style={{ marginTop: 60 }}
            />
          ) : (
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {filteredData.map((item, index) => {
                const statusInfo = getStatusInfo(item.status_pengajuan);
                return (
                  <Card
                    key={index}
                    style={{
                      borderRadius: 12,
                      border: "1px solid #e8e8e8",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                    }}
                    bodyStyle={{ padding: isMobile ? 16 : 20 }}
                  >
                    <Row gutter={[16, 16]}>
                      {/* Header Card */}
                      <Col span={24}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: 12,
                          }}
                        >
                          <Space direction="vertical" size="small">
                            <Space>
                              <FileTextOutlined style={{ color: "#dc2626" }} />
                              <Text strong style={{ fontSize: 16 }}>
                                {item.no_pengajuan}
                              </Text>
                            </Space>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              {dayjs(item.tgl_pengajuan).format(
                                "DD MMMM YYYY, HH:mm"
                              )}
                            </Text>
                          </Space>

                          <Badge
                            status={statusInfo.color}
                            text={
                              <Text strong style={{ color: "#1f2937" }}>
                                {statusInfo.text}
                              </Text>
                            }
                          />
                        </div>
                      </Col>

                      {/* Content */}
                      <Col xs={24} lg={16}>
                        <Descriptions
                          column={isMobile ? 1 : 2}
                          size="small"
                          labelStyle={{ fontWeight: 600, color: "#4b5563" }}
                          contentStyle={{ color: "#1f2937" }}
                        >
                          <Descriptions.Item
                            label={
                              <Space>
                                <UserOutlined />
                                Nama
                              </Space>
                            }
                          >
                            {item.nama.toUpperCase()}
                          </Descriptions.Item>

                          <Descriptions.Item
                            label={
                              <Space>
                                <BankOutlined />
                                Dinas
                              </Space>
                            }
                          >
                            {item.dinas.toUpperCase()}
                          </Descriptions.Item>

                          <Descriptions.Item
                            label="Jenis Kredit"
                            span={isMobile ? 1 : 2}
                          >
                            <Tag color="blue" style={{ fontSize: 12 }}>
                              {item.jns_pinjaman} -{" "}
                              {getProductName(item.jns_pinjaman)}
                            </Tag>
                          </Descriptions.Item>

                          <Descriptions.Item
                            label={
                              <Space>
                                <DollarOutlined />
                                Plafon
                              </Space>
                            }
                          >
                            <Text strong style={{ color: "#dc2626" }}>
                              {formatCurrency(item.plafon_pengajuan)}
                            </Text>
                          </Descriptions.Item>

                          <Descriptions.Item
                            label={
                              <Space>
                                <CalendarOutlined />
                                Tenor
                              </Space>
                            }
                          >
                            {item.jangka_waktu} bulan
                          </Descriptions.Item>

                          <Descriptions.Item
                            label="Kantor Cabang"
                            span={isMobile ? 1 : 2}
                          >
                            {item.kantor_cabang}
                          </Descriptions.Item>
                        </Descriptions>
                      </Col>

                      {/* Timeline Status */}
                      <Col xs={24} lg={8}>
                        <div
                          style={{
                            background: "#f8fafc",
                            padding: 16,
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <Title level={5} style={{ margin: "0 0 12px 0" }}>
                            Status Pengajuan
                          </Title>

                          <Timeline size="small">
                            <Timeline.Item
                              color="green"
                              dot={<CheckCircleOutlined />}
                            >
                              <Text strong>Pengajuan Diterima</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {dayjs(item.tgl_pengajuan).format(
                                  "DD MMM YYYY"
                                )}
                              </Text>
                            </Timeline.Item>

                            <Timeline.Item
                              color={
                                item.status_pengajuan.includes("A1")
                                  ? "blue"
                                  : "green"
                              }
                              dot={statusInfo.icon}
                            >
                              <Text strong>Review Dokumen</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {item.status_pengajuan.includes("A1")
                                  ? "Sedang berjalan"
                                  : "Selesai"}
                              </Text>
                            </Timeline.Item>

                            <Timeline.Item
                              color={
                                item.status_pengajuan.includes("A2")
                                  ? "blue"
                                  : item.status_pengajuan.includes("A3")
                                  ? "green"
                                  : "gray"
                              }
                              dot={
                                item.status_pengajuan.includes("A2") ||
                                item.status_pengajuan.includes("A3") ? (
                                  <ExclamationCircleOutlined />
                                ) : undefined
                              }
                            >
                              <Text strong>Proses Verifikasi</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {item.status_pengajuan.includes("A2")
                                  ? "Sedang berjalan"
                                  : item.status_pengajuan.includes("A3")
                                  ? "Selesai"
                                  : "Menunggu"}
                              </Text>
                            </Timeline.Item>

                            <Timeline.Item
                              color={
                                item.status_pengajuan.includes("A3")
                                  ? "green"
                                  : "gray"
                              }
                              dot={
                                item.status_pengajuan.includes("A3") ? (
                                  <CheckCircleOutlined />
                                ) : undefined
                              }
                            >
                              <Text strong>Persetujuan</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {item.status_pengajuan.includes("A3")
                                  ? "Disetujui"
                                  : "Menunggu"}
                              </Text>
                            </Timeline.Item>
                          </Timeline>
                        </div>
                      </Col>

                      {/* Action Buttons */}
                      <Col span={24}>
                        <div
                          style={{
                            borderTop: "1px solid #f0f0f0",
                            paddingTop: 16,
                          }}
                        >
                          <Space wrap>
                            <Button
                              type="primary"
                              icon={<EyeOutlined />}
                              size="small"
                              style={{
                                background:
                                  "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                                border: "none",
                              }}
                            >
                              Lihat Detail
                            </Button>
                            <Button icon={<DownloadOutlined />} size="small">
                              Unduh Dokumen
                            </Button>
                          </Space>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                );
              })}
            </Space>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BankJatimRiwayatPengajuan;

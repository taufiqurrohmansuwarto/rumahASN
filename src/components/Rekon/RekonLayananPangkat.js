import {
  dashboardKPJatim,
  generateRingkasanAnalisisPangkat,
  ringkasanAnalisisPangkat,
} from "@/services/rekon.services";
import {
  CalendarOutlined,
  DownOutlined,
  FileOutlined,
  FileTextOutlined,
  RobotOutlined,
  SearchOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Flex,
  Grid,
  List,
  message,
  Modal,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const format = "MM-YYYY";
const queryFormat = "DD-MM-YYYY";
const DEFAULT_PERIODE = "01-06-2025";

const ModalRingkasanAnalisis = ({ open, onClose, periode }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { data: ringkasan, isLoading } = useQuery({
    queryKey: ["ringkasanAnalisisPangkat", periode],
    queryFn: () => ringkasanAnalisisPangkat({ tmtKp: periode }),
  });

  const columns = [
    {
      title: "Kategori",
      dataIndex: "kategori",
      key: "kategori",
      width: 200,
      fixed: "left",
      render: (text) => (
        <Space align="center">
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#FF4500",
            }}
          />
          <Text strong style={{ color: "#374151", fontSize: "14px" }}>
            {text}
          </Text>
        </Space>
      ),
    },
    {
      title: "Jumlah",
      dataIndex: "jumlah_alasan",
      key: "jumlah_alasan",
      width: 100,
      align: "center",
      render: (value) => (
        <div
          style={{
            background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
            color: "white",
            padding: "4px 12px",
            borderRadius: "16px",
            fontSize: "12px",
            fontWeight: 600,
            display: "inline-block",
            minWidth: "40px",
            textAlign: "center",
          }}
        >
          {value}
        </div>
      ),
    },
    {
      title: "Ringkasan Analisis",
      dataIndex: "ringkasan",
      key: "ringkasan",
      ellipsis: true,
      render: (text) => (
        <Typography.Paragraph
          ellipsis={{
            rows: 2,
            expandable: true,
            symbol: (
              <Text style={{ color: "#FF4500", fontWeight: 500 }}>
                Baca selengkapnya
              </Text>
            ),
          }}
          style={{
            marginBottom: 0,
            color: "#374151",
            lineHeight: "1.6",
          }}
        >
          {text}
        </Typography.Paragraph>
      ),
    },
  ];

  const expandedRowRender = (record) => (
    <div
      style={{
        background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
        borderRadius: "12px",
        padding: "20px",
        margin: "8px 0",
        border: "1px solid #E2E8F0",
      }}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Flex align="center" gap={12}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "#FF4500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileOutlined style={{ color: "white", fontSize: "14px" }} />
          </div>
          <Title level={5} style={{ margin: 0, color: "#475569" }}>
            Detail Alasan ({record.jumlah_alasan} item)
          </Title>
        </Flex>

        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            paddingRight: "8px",
          }}
        >
          <List
            dataSource={record.daftar_alasan}
            renderItem={(alasan, index) => (
              <List.Item
                key={index}
                style={{
                  padding: "12px 16px",
                  marginBottom: "8px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                }}
              >
                <Flex align="flex-start" gap={12} style={{ width: "100%" }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "#EEF2FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#FF4500",
                      }}
                    >
                      {index + 1}
                    </Text>
                  </div>
                  <Text
                    style={{
                      color: "#475569",
                      lineHeight: "1.6",
                      fontSize: "14px",
                    }}
                  >
                    {alasan}
                  </Text>
                </Flex>
              </List.Item>
            )}
          />
        </div>
      </Space>
    </div>
  );

  return (
    <Modal
      width={isMobile ? "90%" : 1400}
      title={
        <Flex align="center" gap={16} style={{ padding: "8px 0" }}>
          <div
            style={{
              width: isMobile ? "40px" : "48px",
              height: isMobile ? "40px" : "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #FF4500 0%, #E63946 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(255, 69, 0, 0.3)",
            }}
          >
            <FileTextOutlined
              style={{ color: "white", fontSize: isMobile ? "16px" : "20px" }}
            />
          </div>
          <div>
            <Title
              level={3}
              style={{
                margin: 0,
                color: "#1F2937",
                fontSize: isMobile ? "16px" : "20px",
              }}
            >
              Ringkasan Analisis Kenaikan Pangkat
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "12px" : "14px" }}
            >
              Periode: {dayjs(periode, "DD-MM-YYYY").format("MMMM YYYY")}
            </Text>
          </div>
        </Flex>
      }
      open={open}
      onCancel={onClose}
      footer={
        <Flex
          justify="space-between"
          align="center"
          style={{ padding: "8px 0" }}
        >
          <Text type="secondary" style={{ fontSize: "12px" }}>
            💡 Klik pada baris untuk melihat detail alasan
          </Text>
          <Button
            onClick={onClose}
            style={{
              borderRadius: "8px",
              fontWeight: 500,
              height: "36px",
              padding: "0 20px",
            }}
          >
            Tutup
          </Button>
        </Flex>
      }
      styles={{
        content: { borderRadius: "16px" },
        header: { borderBottom: "1px solid #F1F5F9", paddingBottom: "16px" },
        footer: { borderTop: "1px solid #F1F5F9", paddingTop: "16px" },
      }}
    >
      <div style={{ padding: "16px 0" }}>
        <Alert
          message={
            <Flex align="center" gap={8}>
              <RobotOutlined style={{ fontSize: "16px" }} />
              <Text strong>AI Generated Content</Text>
            </Flex>
          }
          description={
            <Text style={{ fontSize: "13px", lineHeight: "1.6" }}>
              Ringkasan ini dibuat menggunakan kecerdasan buatan dan mungkin
              memerlukan verifikasi manual. Gunakan sebagai referensi awal untuk
              analisis lebih lanjut.
            </Text>
          }
          type="warning"
          showIcon={false}
          style={{
            marginBottom: 24,
            borderRadius: "12px",
            border: "1px solid #FCD34D",
            backgroundColor: "#FFFBEB",
          }}
        />

        {isLoading ? (
          <Card
            style={{
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
            }}
            bodyStyle={{ padding: "32px" }}
          >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Skeleton.Input
                active
                style={{ width: "200px", height: "20px" }}
              />
              <Skeleton active paragraph={{ rows: 6 }} />
            </Space>
          </Card>
        ) : ringkasan?.length === 0 ? (
          <Card
            style={{
              borderRadius: "12px",
              textAlign: "center",
              border: "1px solid #E2E8F0",
            }}
            bodyStyle={{ padding: "64px 32px" }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical" size={8}>
                  <Text style={{ color: "#6B7280", fontSize: "16px" }}>
                    Belum ada data analisis
                  </Text>
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    Generate ringkasan analisis terlebih dahulu
                  </Text>
                </Space>
              }
            />
          </Card>
        ) : (
          <Card
            style={{
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
            bodyStyle={{ padding: "0" }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #F1F5F9",
              }}
            >
              <Flex align="center" justify="space-between">
                <Flex align="center" gap={12}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      backgroundColor: "#FF4500",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BarChartOutlined
                      style={{ color: "white", fontSize: "16px" }}
                    />
                  </div>
                  <Title level={5} style={{ margin: 0, color: "#374151" }}>
                    Data Kategorisasi
                  </Title>
                </Flex>
                <Badge
                  count={ringkasan?.length || 0}
                  style={{ backgroundColor: "#FF4500" }}
                />
              </Flex>
            </div>

            <div style={{ padding: "16px" }}>
              <Table
                dataSource={ringkasan}
                columns={columns}
                rowKey="id"
                loading={isLoading}
                pagination={false}
                scroll={{ x: "max-content", y: 500 }}
                style={{ borderRadius: "8px" }}
                size="middle"
                expandable={{
                  expandedRowRender,
                  expandIcon: ({ expanded, onExpand, record }) => (
                    <Button
                      type="text"
                      size="small"
                      icon={expanded ? <UpOutlined /> : <DownOutlined />}
                      onClick={(e) => onExpand(record, e)}
                      style={{
                        borderRadius: "6px",
                        color: "#FF4500",
                        border: "1px solid #E2E8F0",
                      }}
                    />
                  ),
                  expandIconColumnIndex: 0,
                  rowExpandable: (record) => record.daftar_alasan?.length > 0,
                }}
                rowClassName={(record, index) =>
                  index % 2 === 0 ? "table-row-light" : "table-row-dark"
                }
              />
            </div>
          </Card>
        )}
      </div>

      <style jsx>{`
        .table-row-light {
          background-color: #ffffff;
        }
        .table-row-dark {
          background-color: #fafbfc;
        }
        .table-row-light:hover,
        .table-row-dark:hover {
          background-color: #f8fafc !important;
        }
      `}</style>
    </Modal>
  );
};

const ShowRingkasanAnalisis = ({ periode }) => {
  const [open, setOpen] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Lihat ringkasan analisis periode ini">
        <Button
          type="default"
          onClick={() => setOpen(true)}
          icon={<FileTextOutlined />}
          style={{
            borderRadius: "8px",
            fontWeight: 500,
            height: isMobile ? "32px" : "36px",
            fontSize: isMobile ? "12px" : "14px",
          }}
        >
          {isMobile ? "Ringkasan" : "Lihat Ringkasan"}
        </Button>
      </Tooltip>
      <ModalRingkasanAnalisis
        open={open}
        onClose={handleClose}
        periode={periode}
      />
    </>
  );
};

const GenerateRingkasanAnalisis = ({ periode }) => {
  const { data } = useSession();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { mutate, isLoading } = useMutation(
    (data) => generateRingkasanAnalisisPangkat(data),
    {
      onSuccess: () => {
        message.success("Berhasil membuat ringkasan analisis");
      },
      onError: (error) => {
        message.error(
          `Gagal membuat ringkasan: ${error.message || "Terjadi kesalahan"}`
        );
      },
    }
  );

  const handleGenerate = () => {
    Modal.confirm({
      title: "Konfirmasi Generate Ringkasan",
      content:
        "Apakah Anda yakin ingin membuat ringkasan analisis untuk periode ini?",
      okText: "Ya, Generate",
      cancelText: "Batal",
      onOk: () => {
        mutate({ tmtKp: periode });
      },
      styles: {
        content: { borderRadius: "12px" },
      },
    });
  };

  return (
    <>
      {data?.user?.current_role === "admin" && (
        <Tooltip title="Buat ringkasan analisis baru untuk periode ini">
          <Button
            type="primary"
            onClick={handleGenerate}
            loading={isLoading}
            icon={<ThunderboltOutlined />}
            style={{
              backgroundColor: "#FF4500",
              borderColor: "#FF4500",
              borderRadius: "8px",
              fontWeight: 500,
              height: isMobile ? "32px" : "36px",
              fontSize: isMobile ? "12px" : "14px",
            }}
          >
            {isMobile ? "Generate" : "Generate Ringkasan"}
          </Button>
        </Tooltip>
      )}
    </>
  );
};

const getFirstDayOfMonth = (date) => {
  return dayjs(date).startOf("month").format(queryFormat);
};

function RekonLayananPangkat() {
  const [period, setPeriod] = useState(null);
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardKPJatim", period],
    queryFn: () =>
      dashboardKPJatim({
        periode: period ? getFirstDayOfMonth(period) : DEFAULT_PERIODE,
      }),
    refetchOnWindowFocus: false,
  });

  const handleChange = (value) => {
    setPeriod(value);
  };

  const columns = [
    {
      title: "Perangkat Daerah",
      dataIndex: "nama_unor",
      filterSearch: true,
      filters: data?.data?.map((item) => ({
        text: item?.nama_unor,
        value: item?.nama_unor,
      })),
      onFilter: (value, record) =>
        record.nama_unor.toLowerCase().includes(value.toLowerCase()),
      sorter: (a, b) => a.nama_unor.localeCompare(b.nama_unor),
      width: "30%",
      ellipsis: true,
      render: (text) => (
        <Text strong style={{ color: "#374151" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Jumlah Usulan",
      dataIndex: "jumlah_usulan",
      sorter: (a, b) => a.jumlah_usulan - b.jumlah_usulan,
      align: "center",
      render: (value) => (
        <Tag color="#FF4500" style={{ fontWeight: 500 }}>
          {value}
        </Tag>
      ),
    },
    {
      title: "TTD Pertek",
      dataIndex: "jumlah_ttd_pertek",
      sorter: (a, b) => a.jumlah_ttd_pertek - b.jumlah_ttd_pertek,
      align: "center",
      render: (value) => (
        <Tag color="#22C55E" style={{ fontWeight: 500 }}>
          {value}
        </Tag>
      ),
    },
    {
      title: "SK Berhasil",
      dataIndex: "jumlah_sk_berhasil",
      sorter: (a, b) => a.jumlah_sk_berhasil - b.jumlah_sk_berhasil,
      align: "center",
      render: (value) => (
        <Tag color="#F59E0B" style={{ fontWeight: 500 }}>
          {value}
        </Tag>
      ),
    },
  ];

  const statisticItems = [
    {
      title: "Total Usulan",
      value: data?.jumlah_usulan_keseluruhan || 0,
      suffix: "Usulan",
      prefix: <BarChartOutlined />,
      valueStyle: { color: "#FF4500" },
      color: "#fff7e6",
      borderColor: "#ffccc7",
      iconBg: "#FF4500",
    },
  ];

  return (
    <div>
      {/* Header */}
      <Card
        style={{
          marginBottom: isMobile ? "8px" : isTablet ? "12px" : "16px",
          borderRadius: isMobile ? "6px" : isTablet ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex
          align="center"
          gap={isMobile ? 10 : 12}
          wrap={isMobile}
          justify={isMobile ? "center" : "space-between"}
        >
          <Flex align="center" gap={isMobile ? 10 : 12}>
            <div
              style={{
                width: isMobile ? "36px" : "40px",
                height: isMobile ? "36px" : "40px",
                backgroundColor: "#FF4500",
                borderRadius: isMobile ? "6px" : "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BarChartOutlined
                style={{ color: "white", fontSize: isMobile ? "18px" : "20px" }}
              />
            </div>
            <div style={{ flex: 1, textAlign: isMobile ? "center" : "left" }}>
              <Title
                level={isMobile ? 5 : 4}
                style={{
                  margin: 0,
                  color: "#1a1a1a",
                  fontSize: isMobile ? "16px" : "20px",
                }}
              >
                📈 Kenaikan Pangkat
              </Title>
              <Text
                type="secondary"
                style={{
                  fontSize: isMobile ? "11px" : "13px",
                  display: "block",
                  marginTop: "2px",
                }}
              >
                Monitoring dan rekapitulasi data kenaikan pangkat pegawai
              </Text>
            </div>
          </Flex>

          {!isMobile && (
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => router.push("/rekon/dashboard/kenaikan-pangkat")}
              style={{
                backgroundColor: "#FF4500",
                borderColor: "#FF4500",
                borderRadius: "8px",
                fontWeight: 500,
                height: isTablet ? "36px" : "40px",
                padding: "0 20px",
              }}
            >
              Detail Dashboard
            </Button>
          )}
        </Flex>

        {isMobile && (
          <div style={{ marginTop: "12px" }}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => router.push("/rekon/dashboard/kenaikan-pangkat")}
              style={{
                backgroundColor: "#FF4500",
                borderColor: "#FF4500",
                borderRadius: "8px",
                fontWeight: 500,
                height: "36px",
                width: "100%",
              }}
            >
              Detail Dashboard
            </Button>
          </div>
        )}
      </Card>

      {/* Period Selection & Statistics */}
      <Row
        gutter={[isMobile ? 8 : 12, isMobile ? 8 : 12]}
        style={{ marginBottom: isMobile ? "8px" : "16px" }}
      >
        {/* Period Selection */}
        <Col xs={24} md={12} lg={8}>
          <Card
            style={{
              borderRadius: isMobile ? "6px" : isTablet ? "8px" : "12px",
              border: "1px solid #e8e8e8",
              height: "100%",
            }}
          >
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Flex align="center" gap={6}>
                <CalendarOutlined
                  style={{ fontSize: "14px", color: "#FF4500" }}
                />
                <Text
                  strong
                  style={{
                    color: "#1a1a1a",
                    fontSize: isMobile ? "13px" : "15px",
                  }}
                >
                  Pilih Periode
                </Text>
              </Flex>

              <DatePicker.MonthPicker
                format={{
                  format,
                  type: "mask",
                }}
                onChange={handleChange}
                defaultValue={dayjs(DEFAULT_PERIODE, queryFormat)}
                disabledDate={(current) => {
                  return (
                    current &&
                    (current.month() === 0 || // Januari
                      current.month() === 2 || // Maret
                      current.month() === 4 || // Mei
                      current.month() === 6 || // Juli
                      current.month() === 8 || // September
                      current.month() === 10) // November
                  );
                }}
                style={{ width: "100%" }}
                size={isMobile ? "middle" : "large"}
              />
            </Space>
          </Card>
        </Col>

        {/* Statistics */}
        <Col xs={24} md={12} lg={8}>
          {isLoading ? (
            <Card
              style={{
                borderRadius: isMobile ? "6px" : "12px",
                height: "100%",
              }}
            >
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          ) : (
            <div
              style={{
                padding: isMobile
                  ? "10px 6px"
                  : isTablet
                  ? "14px 10px"
                  : "16px 12px",
                borderRadius: isMobile ? "6px" : "8px",
                border: `1px solid ${statisticItems[0].borderColor}`,
                backgroundColor: statisticItems[0].color,
                transition: "all 0.3s ease",
                cursor: "default",
                height: "100%",
                minHeight: isMobile ? "90px" : isTablet ? "100px" : "110px",
              }}
            >
              <Space
                direction="vertical"
                size={isMobile ? 4 : isTablet ? 6 : 8}
                style={{ width: "100%" }}
              >
                {/* Header */}
                <Flex align="center" gap={6} style={{ flex: 1 }}>
                  <div
                    style={{
                      width: isMobile ? "24px" : isTablet ? "28px" : "32px",
                      height: isMobile ? "24px" : isTablet ? "28px" : "32px",
                      borderRadius: "6px",
                      backgroundColor: statisticItems[0].iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {React.cloneElement(statisticItems[0].prefix, {
                      style: {
                        color: "white",
                        fontSize: isMobile
                          ? "12px"
                          : isTablet
                          ? "14px"
                          : "16px",
                      },
                    })}
                  </div>
                  <Text
                    strong
                    style={{
                      color: "#1a1a1a",
                      fontSize: isMobile ? "10px" : "12px",
                      lineHeight: "1.2",
                    }}
                  >
                    {statisticItems[0].title}
                  </Text>
                </Flex>

                {/* Statistic */}
                <div style={{ marginTop: isMobile ? "4px" : "6px" }}>
                  <Flex align="baseline" gap={4}>
                    <Text
                      style={{
                        ...statisticItems[0].valueStyle,
                        fontSize: isMobile ? "16px" : "20px",
                        fontWeight: 600,
                        lineHeight: "1.2",
                      }}
                    >
                      {statisticItems[0].value?.toLocaleString() || 0}
                    </Text>
                    <Text
                      style={{
                        fontSize: isMobile ? "9px" : "10px",
                        color: "#666",
                        fontWeight: 400,
                      }}
                    >
                      {statisticItems[0].suffix}
                    </Text>
                  </Flex>
                </div>
              </Space>
            </div>
          )}
        </Col>

        {/* Actions */}
        <Col xs={24} lg={8}>
          <Card
            style={{
              borderRadius: isMobile ? "6px" : isTablet ? "8px" : "12px",
              border: "1px solid #e8e8e8",
              height: "100%",
            }}
          >
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Flex align="center" gap={6}>
                <ThunderboltOutlined
                  style={{ fontSize: "14px", color: "#FF4500" }}
                />
                <Text
                  strong
                  style={{
                    color: "#1a1a1a",
                    fontSize: isMobile ? "13px" : "15px",
                  }}
                >
                  Aksi Tersedia
                </Text>
              </Flex>

              <Space wrap size={[8, 8]} style={{ width: "100%" }}>
                <GenerateRingkasanAnalisis
                  periode={
                    period ? getFirstDayOfMonth(period) : DEFAULT_PERIODE
                  }
                />
                <ShowRingkasanAnalisis
                  periode={
                    period ? getFirstDayOfMonth(period) : DEFAULT_PERIODE
                  }
                />
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Data Table Section */}
      <Card
        style={{
          borderRadius: isMobile ? "6px" : isTablet ? "8px" : "12px",
          border: "1px solid #e8e8e8",
          marginBottom: isMobile ? "8px" : isTablet ? "12px" : "16px",
        }}
      >
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : data?.data && data.data.length > 0 ? (
          <Space
            direction="vertical"
            size={isMobile ? 16 : 20}
            style={{ width: "100%" }}
          >
            <Flex
              align="center"
              gap={8}
              wrap={isMobile}
              justify="space-between"
            >
              <Flex align="center" gap={8}>
                <div
                  style={{
                    width: isMobile ? "32px" : "36px",
                    height: isMobile ? "32px" : "36px",
                    borderRadius: "6px",
                    backgroundColor: "#FF4500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <TeamOutlined
                    style={{
                      color: "white",
                      fontSize: isMobile ? "16px" : "18px",
                    }}
                  />
                </div>
                <Title
                  level={isMobile ? 5 : 4}
                  style={{
                    margin: 0,
                    color: "#1a1a1a",
                    fontSize: isMobile ? "14px" : "18px",
                  }}
                >
                  📊 Data Perangkat Daerah
                </Title>
              </Flex>

              <div
                style={{
                  backgroundColor: "#FF4500",
                  color: "white",
                  padding: isMobile ? "4px 8px" : "6px 12px",
                  borderRadius: "16px",
                  fontSize: isMobile ? "11px" : "12px",
                  fontWeight: 600,
                  minWidth: "fit-content",
                }}
              >
                Total: {data?.data?.length || 0}
              </div>
            </Flex>

            <div
              style={{
                padding: isMobile ? "4px 0" : "8px 0",
                overflow: "hidden",
              }}
            >
              <Table
                rowKey={(row) => row?.id_unor}
                dataSource={data?.data}
                loading={isLoading}
                columns={columns}
                pagination={{
                  pageSize: 15,
                  position: ["bottomRight"],
                  showSizeChanger: false,
                  showTotal: (total) => `Total ${total} item`,
                  style: { marginTop: "24px" },
                }}
                sortDirections={["ascend", "descend"]}
                scroll={{ x: "max-content" }}
                style={{ borderRadius: "8px" }}
                size={isMobile ? "small" : "middle"}
              />
            </div>
          </Space>
        ) : (
          <Flex
            vertical
            align="center"
            justify="center"
            style={{
              padding: isMobile ? "30px 20px" : "40px 20px",
              color: "#999",
            }}
          >
            <TeamOutlined
              style={{
                color: "#d9d9d9",
                fontSize: isMobile ? "40px" : "48px",
                marginBottom: "12px",
              }}
            />
            <Title
              level={isMobile ? 5 : 4}
              style={{ color: "#999", margin: "0 0 6px 0" }}
            >
              Tidak ada data tersedia
            </Title>
            <Text
              type="secondary"
              style={{
                textAlign: "center",
                fontSize: isMobile ? "12px" : "14px",
              }}
            >
              Tidak ada data yang tersedia untuk periode ini
              <br />
              Silakan pilih periode lain atau hubungi administrator
            </Text>
          </Flex>
        )}
      </Card>

      <style jsx global>{`
        .ant-card {
          transition: all 0.3s ease !important;
          box-shadow: none !important;
          border: 1px solid #e8e8e8 !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
        }

        .ant-date-picker:not(.ant-picker-disabled):hover .ant-picker-selector,
        .ant-picker:not(.ant-picker-disabled):hover .ant-picker-selector {
          border-color: #ff4500 !important;
        }

        .ant-date-picker-focused .ant-picker-selector,
        .ant-picker-focused .ant-picker-selector {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-btn-primary {
          background: #ff4500 !important;
          border-color: #ff4500 !important;
        }

        .ant-btn-primary:hover {
          background: #ff6b35 !important;
          border-color: #ff6b35 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 8px rgba(255, 69, 0, 0.25) !important;
        }

        .ant-tag {
          border-radius: 4px !important;
        }

        .ant-table-thead > tr > th {
          background: #fafafa !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }

        .ant-table-tbody > tr:hover > td {
          background: #fff7e6 !important;
        }

        @media (max-width: 576px) {
          .ant-col {
            margin-bottom: 4px !important;
          }

          .ant-card-body {
            padding: 12px 8px !important;
          }

          .ant-space-vertical {
            gap: 4px !important;
          }

          .ant-card {
            margin-bottom: 8px !important;
          }

          .ant-table-pagination {
            margin-top: 12px !important;
          }
        }

        @media (max-width: 768px) {
          .ant-col {
            margin-bottom: 6px !important;
          }

          .ant-card-body {
            padding: 16px 12px !important;
          }

          .ant-card {
            margin-bottom: 12px !important;
          }
        }

        @media (min-width: 769px) and (max-width: 1199px) {
          .ant-card-body {
            padding: 20px 16px !important;
          }

          .ant-card {
            margin-bottom: 16px !important;
          }
        }

        @media (min-width: 1200px) {
          .ant-card-body {
            padding: 24px 20px !important;
          }

          .ant-card {
            margin-bottom: 20px !important;
          }
        }

        .ant-skeleton-content .ant-skeleton-paragraph > li {
          height: 10px !important;
        }
      `}</style>
    </div>
  );
}

export default RekonLayananPangkat;

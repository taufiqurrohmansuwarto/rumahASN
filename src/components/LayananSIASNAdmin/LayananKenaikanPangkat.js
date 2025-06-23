import {
  daftarKenaikanPangkat,
  syncKenaikanPangkat,
} from "@/services/siasn-services";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloudDownloadOutlined,
  FilterOutlined,
  SyncOutlined,
  UpOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  DatePicker,
  Flex,
  FloatButton,
  Grid,
  message,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";

dayjs.extend(relativeTime);

const FORMAT = "DD-MM-YYYY";
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function LayananKenaikanPangkat() {
  const router = useRouter();
  const { page = 1, limit = 10 } = router.query;
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const [periode, setPeriode] = useState(() => {
    const today = dayjs();
    const defaultPeriode = today.startOf("month").format(FORMAT);
    return router.query.periode || defaultPeriode;
  });

  const { data, isLoading, isFetching, error, refetch } = useQuery(
    ["kenaikan-pangkat", periode, page, limit],
    () => daftarKenaikanPangkat({ periode, page, limit }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const handleChangePeriode = useCallback(
    (value) => {
      const newPeriode = value.startOf("month").format(FORMAT);
      setPeriode(newPeriode);
      router.push({
        pathname: "/layanan-siasn/kenaikan-pangkat",
        query: { periode: newPeriode, page: 1 },
      });
    },
    [router]
  );

  const { mutate: sync, isLoading: isLoadingSync } = useMutation(
    (data) => syncKenaikanPangkat(data),
    {
      onSuccess: () => message.success("Data berhasil disinkronisasi"),
      onError: (error) => message.error(error?.response?.data?.message),
      onSettled: () => refetch(),
    }
  );

  const handleSync = () => sync({ periode });

  const handleChangePage = (page, limit) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        page,
        limit,
      },
    });
  };

  const clearFilter = () => {
    const { periode, ...restQuery } = router.query;
    router.push({
      pathname: router.pathname,
      query: { ...restQuery, page: 1 },
    });
  };

  // Helper function untuk mendapatkan konfigurasi status
  const getStatusConfig = (status) => {
    const statusMap = {
      "Sdh di TTD - Pertek": {
        color: "success",
        icon: "✅",
        bgColor: "#f6ffed",
        borderColor: "#b7eb8f",
      },
      "Sdh di TTD - SK": {
        color: "blue",
        icon: "📄",
        bgColor: "#f0f5ff",
        borderColor: "#adc6ff",
      },
      "Menunggu Persetujuan": {
        color: "warning",
        icon: "⏳",
        bgColor: "#fff7e6",
        borderColor: "#ffd666",
      },
      Ditolak: {
        color: "error",
        icon: "❌",
        bgColor: "#fff2f0",
        borderColor: "#ffccc7",
      },
    };

    return (
      statusMap[status] || {
        color: "default",
        icon: "📋",
        bgColor: "#fafafa",
        borderColor: "#d9d9d9",
      }
    );
  };

  // Helper function untuk mendapatkan konfigurasi jenis KP
  const getJenisKPConfig = (jenis) => {
    const jenisMap = {
      "Kenaikan Pangkat Struktural": {
        color: "purple",
        icon: "👔",
        bgColor: "#f9f0ff",
        borderColor: "#d3adf7",
      },
      "Kenaikan Pangkat Fungsional": {
        color: "cyan",
        icon: "🎓",
        bgColor: "#e6fffb",
        borderColor: "#87e8de",
      },
      "Kenaikan Pangkat Reguler": {
        color: "blue",
        icon: "⬆️",
        bgColor: "#f0f5ff",
        borderColor: "#adc6ff",
      },
      "Kenaikan Pangkat Pilihan": {
        color: "gold",
        icon: "⭐",
        bgColor: "#fff7e6",
        borderColor: "#ffd666",
      },
    };

    return (
      jenisMap[jenis] || {
        color: "default",
        icon: "📈",
        bgColor: "#fafafa",
        borderColor: "#d9d9d9",
      }
    );
  };

  const columns = [
    {
      title: (
        <Space>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            👤 Informasi Pegawai
          </Text>
        </Space>
      ),
      key: "pegawai_info",
      width: isMobile ? 280 : isTablet ? 320 : 380,
      render: (_, record) => (
        <div
          style={{
            padding: isMobile ? "12px" : "16px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
            border: "1px solid #e8e8e8",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#FF4500";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(255, 69, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e8e8e8";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Flex align="center" gap={12}>
            <div style={{ position: "relative" }}>
              <Avatar
                size={isMobile ? 50 : 60}
                src={record?.pegawai?.foto}
                style={{
                  background: record?.pegawai?.foto
                    ? "transparent"
                    : "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                  border: "3px solid #fff",
                  boxShadow: "0 4px 12px rgba(255, 69, 0, 0.3)",
                }}
                icon={<UserOutlined />}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "#52c41a",
                  border: "3px solid #fff",
                }}
              />
            </div>
            <Flex vertical gap={4} style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: isMobile ? "13px" : "15px",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  lineHeight: 1.2,
                }}
                ellipsis={{
                  tooltip: record?.pegawai?.nama_master || record?.nama,
                }}
              >
                {record?.pegawai?.nama_master || record?.nama}
              </Text>
              <Flex align="center" gap={4}>
                <Text
                  style={{
                    fontSize: isMobile ? "10px" : "11px",
                    color: "#666",
                    fontWeight: 500,
                  }}
                >
                  NIP:
                </Text>
                <Text
                  style={{
                    fontSize: isMobile ? "10px" : "11px",
                    color: "#1890ff",
                    fontFamily: "monospace",
                    fontWeight: 600,
                    backgroundColor: "#f0f5ff",
                    padding: "1px 4px",
                    borderRadius: "4px",
                  }}
                >
                  {record?.nipBaru}
                </Text>
              </Flex>
              <Text
                style={{
                  fontSize: isMobile ? "10px" : "11px",
                  color: "#666",
                  lineHeight: 1.3,
                  maxWidth: "200px",
                }}
                ellipsis={{ tooltip: record?.pegawai?.opd_master }}
              >
                {record?.pegawai?.opd_master}
              </Text>
            </Flex>
          </Flex>
        </div>
      ),
    },
    {
      title: (
        <Space>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UpOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            🎯 Kenaikan Pangkat
          </Text>
        </Space>
      ),
      key: "kenaikan_pangkat",
      width: isMobile ? 200 : isTablet ? 240 : 280,
      render: (_, record) => {
        const jenisConfig = getJenisKPConfig(record?.jenis_kp);

        return (
          <div
            style={{
              padding: isMobile ? "10px" : "12px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #fff 0%, #f9f0ff 100%)",
              border: "1px solid #d3adf7",
              transition: "all 0.3s ease",
            }}
          >
            <Flex vertical gap={8}>
              {/* Jenis KP */}
              <Flex align="center" gap={6}>
                <Text
                  style={{
                    fontSize: isMobile ? "9px" : "10px",
                    color: "#666",
                    fontWeight: 500,
                    minWidth: "35px",
                  }}
                >
                  Jenis:
                </Text>
                <Tag
                  style={{
                    borderRadius: "16px",
                    fontSize: isMobile ? "9px" : "10px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    border: `1px solid ${jenisConfig.borderColor}`,
                    backgroundColor: jenisConfig.bgColor,
                    color: "#1a1a1a",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    maxWidth: "160px",
                  }}
                  icon={
                    <span style={{ fontSize: "10px" }}>{jenisConfig.icon}</span>
                  }
                >
                  {record?.jenis_kp?.replace("Kenaikan Pangkat ", "") ||
                    "Unknown"}
                </Tag>
              </Flex>

              {/* TMT */}
              <Flex align="center" gap={6}>
                <Text
                  style={{
                    fontSize: isMobile ? "9px" : "10px",
                    color: "#666",
                    fontWeight: 500,
                    minWidth: "35px",
                  }}
                >
                  TMT:
                </Text>
                <Tag
                  color="blue"
                  style={{
                    borderRadius: "16px",
                    fontSize: isMobile ? "9px" : "10px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    fontFamily: "monospace",
                  }}
                >
                  📅 {record?.tmtKp || "N/A"}
                </Tag>
              </Flex>

              {/* Masa Kerja */}
              {(record?.masa_kerja_tahun || record?.masa_kerja_bulan) && (
                <Flex align="center" gap={6}>
                  <Text
                    style={{
                      fontSize: isMobile ? "9px" : "10px",
                      color: "#666",
                      fontWeight: 500,
                      minWidth: "35px",
                    }}
                  >
                    M.Kerja:
                  </Text>
                  <Tag
                    color="green"
                    style={{
                      borderRadius: "16px",
                      fontSize: isMobile ? "9px" : "10px",
                      fontWeight: 600,
                      padding: "2px 8px",
                    }}
                  >
                    ⏱️ {record?.masa_kerja_tahun || 0}th{" "}
                    {record?.masa_kerja_bulan || 0}bl
                  </Tag>
                </Flex>
              )}
            </Flex>
          </div>
        );
      },
    },
    {
      title: (
        <Space>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircleOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            📋 Status & Dokumen
          </Text>
        </Space>
      ),
      key: "status_dokumen",
      width: isMobile ? 180 : isTablet ? 220 : 260,
      render: (_, record) => {
        const statusConfig = getStatusConfig(record?.statusUsulanNama);

        return (
          <div
            style={{
              padding: isMobile ? "10px" : "12px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
              border: "1px solid #e8e8e8",
              transition: "all 0.3s ease",
            }}
          >
            <Flex vertical gap={8}>
              {/* Status */}
              <Flex align="center" gap={6}>
                <Text
                  style={{
                    fontSize: isMobile ? "9px" : "10px",
                    color: "#666",
                    fontWeight: 500,
                    minWidth: "40px",
                  }}
                >
                  Status:
                </Text>
                <Tag
                  style={{
                    borderRadius: "16px",
                    fontSize: isMobile ? "9px" : "10px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    border: `1px solid ${statusConfig.borderColor}`,
                    backgroundColor: statusConfig.bgColor,
                    color: "#1a1a1a",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    maxWidth: "140px",
                  }}
                  icon={
                    <span style={{ fontSize: "10px" }}>
                      {statusConfig.icon}
                    </span>
                  }
                >
                  {record?.statusUsulanNama || "Unknown"}
                </Tag>
              </Flex>

              {/* Dokumen */}
              <Flex align="center" gap={6}>
                <Text
                  style={{
                    fontSize: isMobile ? "9px" : "10px",
                    color: "#666",
                    fontWeight: 500,
                    minWidth: "40px",
                  }}
                >
                  File:
                </Text>
                <Space size={4}>
                  {record?.path_ttd_pertek && (
                    <Tooltip title="Download Pertek">
                      <a
                        href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_pertek}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Tag
                          color="orange"
                          style={{
                            borderRadius: "12px",
                            fontSize: "8px",
                            padding: "2px 6px",
                            cursor: "pointer",
                          }}
                        >
                          📄 Pertek
                        </Tag>
                      </a>
                    </Tooltip>
                  )}
                  {record?.path_ttd_sk && (
                    <Tooltip title="Download SK">
                      <a
                        href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_sk}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Tag
                          color="blue"
                          style={{
                            borderRadius: "12px",
                            fontSize: "8px",
                            padding: "2px 6px",
                            cursor: "pointer",
                          }}
                        >
                          📄 SK
                        </Tag>
                      </a>
                    </Tooltip>
                  )}
                  {!record?.path_ttd_pertek && !record?.path_ttd_sk && (
                    <Tag
                      color="default"
                      style={{
                        borderRadius: "12px",
                        fontSize: "8px",
                        padding: "2px 6px",
                      }}
                    >
                      📄 No File
                    </Tag>
                  )}
                </Space>
              </Flex>
            </Flex>
          </div>
        );
      },
    },
    {
      title: (
        <Space>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            💼 Jabatan
          </Text>
        </Space>
      ),
      key: "jabatan",
      width: isMobile ? 140 : isTablet ? 160 : 200,
      render: (_, record) => (
        <div
          style={{
            padding: isMobile ? "8px" : "12px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
            border: "1px solid #e8e8e8",
            transition: "all 0.3s ease",
          }}
        >
          <Flex vertical gap={6}>
            {record?.jabatan_struktural && (
              <Tag
                color="blue"
                style={{
                  borderRadius: "12px",
                  fontSize: isMobile ? "9px" : "10px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  textAlign: "center",
                  maxWidth: "100%",
                }}
              >
                👔 {record.jabatan_struktural}
              </Tag>
            )}
            {record?.jabatan_fungsional && (
              <Tag
                color="green"
                style={{
                  borderRadius: "12px",
                  fontSize: isMobile ? "9px" : "10px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  textAlign: "center",
                  maxWidth: "100%",
                }}
              >
                🎓 {record.jabatan_fungsional}
              </Tag>
            )}
            {record?.jabatan_fungsional_umum && (
              <Tag
                color="orange"
                style={{
                  borderRadius: "12px",
                  fontSize: isMobile ? "9px" : "10px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  textAlign: "center",
                  maxWidth: "100%",
                }}
              >
                📋 {record.jabatan_fungsional_umum}
              </Tag>
            )}
            {!record?.jabatan_struktural &&
              !record?.jabatan_fungsional &&
              !record?.jabatan_fungsional_umum && (
                <Tag
                  color="default"
                  style={{
                    borderRadius: "12px",
                    fontSize: isMobile ? "9px" : "10px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    textAlign: "center",
                  }}
                >
                  📋 Tidak ada jabatan
                </Tag>
              )}
          </Flex>
        </div>
      ),
    },
    {
      title: (
        <Space>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text strong style={{ color: "white", fontSize: "10px" }}>
              💰
            </Text>
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            💰 Informasi Gaji
          </Text>
        </Space>
      ),
      key: "gaji_info",
      width: isMobile ? 120 : isTablet ? 140 : 180,
      render: (_, record) => (
        <div
          style={{
            padding: isMobile ? "8px" : "12px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #fff 0%, #f6ffed 100%)",
            border: "1px solid #b7eb8f",
            transition: "all 0.3s ease",
          }}
        >
          <Flex vertical gap={6}>
            {/* Gaji Lama */}
            {record?.gaji_pokok_lama && (
              <Flex align="center" gap={4}>
                <Text
                  style={{
                    fontSize: isMobile ? "8px" : "9px",
                    color: "#666",
                    fontWeight: 500,
                    minWidth: "25px",
                  }}
                >
                  Lama:
                </Text>
                <Tag
                  color="red"
                  style={{
                    borderRadius: "8px",
                    fontSize: isMobile ? "8px" : "9px",
                    fontWeight: 600,
                    padding: "1px 6px",
                    fontFamily: "monospace",
                  }}
                >
                  {parseInt(record.gaji_pokok_lama).toLocaleString("id-ID")}
                </Tag>
              </Flex>
            )}

            {/* Gaji Baru */}
            {record?.gaji_pokok_baru && (
              <Flex align="center" gap={4}>
                <Text
                  style={{
                    fontSize: isMobile ? "8px" : "9px",
                    color: "#666",
                    fontWeight: 500,
                    minWidth: "25px",
                  }}
                >
                  Baru:
                </Text>
                <Tag
                  color="green"
                  style={{
                    borderRadius: "8px",
                    fontSize: isMobile ? "8px" : "9px",
                    fontWeight: 600,
                    padding: "1px 6px",
                    fontFamily: "monospace",
                  }}
                >
                  {parseInt(record.gaji_pokok_baru).toLocaleString("id-ID")}
                </Tag>
              </Flex>
            )}

            {/* Selisih */}
            {record?.gaji_pokok_lama && record?.gaji_pokok_baru && (
              <Flex align="center" gap={4}>
                <Text
                  style={{
                    fontSize: isMobile ? "8px" : "9px",
                    color: "#666",
                    fontWeight: 500,
                    minWidth: "25px",
                  }}
                >
                  +
                </Text>
                <Tag
                  color="blue"
                  style={{
                    borderRadius: "8px",
                    fontSize: isMobile ? "8px" : "9px",
                    fontWeight: 600,
                    padding: "1px 6px",
                    fontFamily: "monospace",
                  }}
                >
                  {(
                    parseInt(record.gaji_pokok_baru) -
                    parseInt(record.gaji_pokok_lama)
                  ).toLocaleString("id-ID")}
                </Tag>
              </Flex>
            )}
          </Flex>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          backgroundColor: "#fff2f0",
          borderRadius: "12px",
          border: "1px solid #ffccc7",
        }}
      >
        <Text type="danger" style={{ fontSize: "16px" }}>
          ❌ Error: {error.message}
        </Text>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: isMobile ? "12px" : "20px",
        backgroundColor: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <FloatButton.BackTop />

      {/* Header */}
      <Card
        style={{
          marginBottom: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex align="center" gap={isMobile ? 12 : 16} wrap>
          <div
            style={{
              width: isMobile ? "40px" : "48px",
              height: isMobile ? "40px" : "48px",
              backgroundColor: "#FF4500",
              borderRadius: isMobile ? "8px" : "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UpOutlined
              style={{
                color: "white",
                fontSize: isMobile ? "16px" : "20px",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Title
              level={isMobile ? 4 : 3}
              style={{ margin: 0, color: "#1a1a1a" }}
            >
              📈 Integrasi Kenaikan Pangkat
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "12px" : "14px" }}
            >
              Monitoring dan sinkronisasi data kenaikan pangkat dari SIASN
            </Text>
          </div>
        </Flex>
      </Card>

      {/* Filter Card */}
      <Card
        style={{
          marginBottom: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex
          align={isMobile ? "flex-start" : "center"}
          gap={isMobile ? 8 : 12}
          wrap
          justify="space-between"
          vertical={isMobile}
        >
          <Flex
            align="center"
            gap={isMobile ? 8 : 12}
            wrap
            style={{ flex: 1, width: isMobile ? "100%" : "auto" }}
          >
            <Flex align="center" gap={8}>
              <FilterOutlined
                style={{
                  color: "#FF4500",
                  fontSize: isMobile ? "14px" : "16px",
                }}
              />
              <Text
                strong
                style={{
                  color: "#1a1a1a",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              >
                Filter:
              </Text>
            </Flex>

            <Flex align="center" gap={6}>
              <CalendarOutlined
                style={{
                  color: "#666",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              />
              <DatePicker
                picker="month"
                format={FORMAT}
                onChange={handleChangePeriode}
                value={dayjs(periode, FORMAT)}
                placeholder="Pilih Periode"
                style={{ width: isMobile ? 130 : 160 }}
                size={isMobile ? "small" : "middle"}
              />
            </Flex>

            <Button
              loading={isFetching}
              onClick={() => refetch()}
              style={{
                borderColor: "#FF4500",
                color: "#FF4500",
                fontSize: isMobile ? "11px" : "14px",
              }}
              size={isMobile ? "small" : "middle"}
            >
              🔄 Reload
            </Button>

            {periode !== dayjs().startOf("month").format(FORMAT) && (
              <Button
                size="small"
                onClick={clearFilter}
                style={{
                  borderColor: "#FF4500",
                  color: "#FF4500",
                  fontSize: isMobile ? "11px" : "14px",
                }}
              >
                Clear Filter
              </Button>
            )}

            {periode !== dayjs().startOf("month").format(FORMAT) && (
              <Tag
                color="orange"
                style={{
                  borderRadius: "12px",
                  fontSize: "11px",
                  padding: "2px 8px",
                }}
              >
                📅 {dayjs(periode, FORMAT).locale("id").format("MMMM YYYY")}
              </Tag>
            )}
          </Flex>

          <Flex
            gap={8}
            vertical={isMobile}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            <Tooltip title="Ambil data terbaru dari SIASN">
              <Button
                onClick={handleSync}
                loading={isLoadingSync}
                type="primary"
                icon={<SyncOutlined />}
                style={{
                  backgroundColor: "#FF4500",
                  borderColor: "#FF4500",
                  borderRadius: "6px",
                  fontWeight: 500,
                }}
                size={isMobile ? "small" : "middle"}
              >
                {isMobile ? "🔄 Sinkron" : "🔄 Sinkron Data"}
              </Button>
            </Tooltip>
            <Button
              icon={<CloudDownloadOutlined />}
              style={{
                borderColor: "#FF4500",
                color: "#FF4500",
                borderRadius: "6px",
                fontWeight: 500,
              }}
              size={isMobile ? "small" : "middle"}
            >
              {isMobile ? "📥 Download" : "📥 Unduh Data"}
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Stats Card */}
      {data && (
        <Card
          style={{
            marginBottom: isMobile ? "12px" : "20px",
            borderRadius: isMobile ? "8px" : "12px",
            border: "1px solid #e8e8e8",
          }}
        >
          <Flex justify="space-around" align="center" wrap>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#FF4500",
                }}
              >
                {data.total?.toLocaleString() || data?.data?.length || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Total Data
              </Text>
            </Flex>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#52c41a",
                }}
              >
                {data?.data?.filter((item) =>
                  item.statusUsulanNama?.includes("TTD")
                ).length || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Sudah TTD
              </Text>
            </Flex>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#1890ff",
                }}
              >
                {data?.data?.filter((item) =>
                  item.jenis_kp?.includes("Struktural")
                ).length || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Struktural
              </Text>
            </Flex>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#722ed1",
                }}
              >
                {data?.data?.filter((item) =>
                  item.jenis_kp?.includes("Fungsional")
                ).length || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Fungsional
              </Text>
            </Flex>
          </Flex>
        </Card>
      )}

      {/* Table */}
      <Card
        style={{
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Table
          pagination={{
            current: parseInt(page),
            pageSize: parseInt(limit),
            total: data?.total ?? data?.data?.length ?? 0,
            showTotal: (total, range) => (
              <Text
                style={{ color: "#666", fontSize: isMobile ? "11px" : "14px" }}
              >
                {isMobile ? (
                  `${range[0]}-${range[1]} / ${total.toLocaleString()}`
                ) : (
                  <>
                    Menampilkan{" "}
                    <Text strong style={{ color: "#FF4500" }}>
                      {range[0]}-{range[1]}
                    </Text>{" "}
                    dari{" "}
                    <Text strong style={{ color: "#FF4500" }}>
                      {total.toLocaleString()}
                    </Text>{" "}
                    data kenaikan pangkat
                    {periode !== dayjs().startOf("month").format(FORMAT) && (
                      <Text style={{ color: "#999" }}>
                        {" "}
                        (periode{" "}
                        {dayjs(periode, FORMAT)
                          .locale("id")
                          .format("MMMM YYYY")}
                        )
                      </Text>
                    )}
                  </>
                )}
              </Text>
            ),
            showSizeChanger: !isMobile,
            pageSizeOptions: ["10", "20", "50"],
            simple: isMobile,
            onChange: handleChangePage,
            style: {
              marginTop: isMobile ? "12px" : "20px",
              padding: isMobile ? "8px 0" : "16px 0",
              borderTop: "1px solid #f0f0f0",
            },
          }}
          columns={columns}
          rowKey={(row) => row?.id}
          dataSource={data?.data}
          loading={isLoading || isFetching}
          size={isMobile ? "small" : "middle"}
          scroll={{ x: isMobile ? 800 : isTablet ? 1000 : undefined }}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      </Card>

      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: #ffffff !important;
          color: #1a1a1a !important;
          font-weight: 600 !important;
          border-bottom: 2px solid #ff4500 !important;
          padding: ${isMobile ? "12px 8px" : "16px 12px"} !important;
          font-size: ${isMobile ? "11px" : "14px"} !important;
        }

        .ant-table-thead > tr > th:first-child {
          border-top-left-radius: 8px !important;
        }

        .ant-table-thead > tr > th:last-child {
          border-top-right-radius: 8px !important;
        }

        .table-row-light {
          background-color: #ffffff !important;
        }

        .table-row-dark {
          background-color: #fafafa !important;
        }

        .ant-table-tbody > tr:hover > td {
          background-color: #fff7e6 !important;
          transition: all 0.2s ease !important;
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          padding: ${isMobile ? "8px 6px" : "12px"} !important;
          transition: all 0.2s ease !important;
        }

        .ant-pagination-item-active {
          background: linear-gradient(
            135deg,
            #ff4500 0%,
            #ff6b35 100%
          ) !important;
          border-color: #ff4500 !important;
          box-shadow: 0 2px 4px rgba(255, 69, 0, 0.3) !important;
        }

        .ant-pagination-item-active a {
          color: white !important;
          font-weight: 600 !important;
        }

        .ant-pagination-item:hover {
          border-color: #ff4500 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 4px rgba(255, 69, 0, 0.2) !important;
          transition: all 0.2s ease !important;
        }

        .ant-pagination-item:hover a {
          color: #ff4500 !important;
        }

        .ant-picker:hover,
        .ant-picker-focused {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-table-container {
          border-radius: 8px !important;
          overflow: hidden !important;
        }

        .ant-card {
          transition: all 0.3s ease !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
        }

        @media (max-width: 768px) {
          .ant-table-pagination {
            text-align: center !important;
          }

          .ant-pagination-simple .ant-pagination-simple-pager {
            margin: 0 8px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default LayananKenaikanPangkat;

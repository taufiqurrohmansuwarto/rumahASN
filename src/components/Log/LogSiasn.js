import { logSIASN } from "@/services/log.services";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Collapse,
  DatePicker,
  Flex,
  Grid,
  Input,
  message,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { upperCase } from "lodash";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";

dayjs.extend(relativeTime);

// Dynamic imports untuk mencegah SSR issues
const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const showModalInformation = (item, title = "SIASN") => {
  Modal.info({
    title: (
      <Flex align="center" gap={8}>
        <DatabaseOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
        <Text strong style={{ fontSize: "16px" }}>
          Detail Log {title}
        </Text>
      </Flex>
    ),
    centered: true,
    width: 900,
    footer: null,
    styles: {
      header: {
        borderBottom: "2px solid #FF4500",
        paddingBottom: "16px",
        marginBottom: "20px",
      },
    },
    content: (
      <Collapse
        ghost
        expandIconPosition="end"
        style={{
          backgroundColor: "#fafafa",
          borderRadius: "8px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Collapse.Panel
          header={
            <Flex align="center" gap={8}>
              <Tag color="blue" icon={<DatabaseOutlined />}>
                Request Data
              </Tag>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Data yang dikirim ke SIASN
              </Text>
            </Flex>
          }
          key="1"
          style={{
            backgroundColor: "#ffffff",
            marginBottom: "8px",
            borderRadius: "6px",
            border: "1px solid #e0e0e0",
          }}
        >
          <div
            style={{
              maxHeight: 400,
              overflow: "auto",
              backgroundColor: "#f8f9fa",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #e0e0e0",
            }}
          >
            <ReactJson
              src={item?.request_data ? JSON.parse(item.request_data) : {}}
              theme="rjv-default"
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={true}
              collapsed={false}
              iconStyle="triangle"
            />
          </div>
        </Collapse.Panel>
        <Collapse.Panel
          header={
            <Flex align="center" gap={8}>
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Response Data
              </Tag>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Data yang diterima dari SIASN
              </Text>
            </Flex>
          }
          key="2"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "6px",
            border: "1px solid #e0e0e0",
          }}
        >
          <div
            style={{
              maxHeight: 400,
              overflow: "auto",
              backgroundColor: "#f8f9fa",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #e0e0e0",
            }}
          >
            <ReactJson
              src={item?.response_data ? JSON.parse(item.response_data) : {}}
              theme="rjv-default"
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={true}
              collapsed={false}
              iconStyle="triangle"
            />
          </div>
        </Collapse.Panel>
      </Collapse>
    ),
  });
};

const LogSiasn = () => {
  const router = useRouter();
  const { page = 1, limit = 15, bulan, search, mandiri } = router.query;
  const screens = useBreakpoint();
  const isMobile = !screens?.md;

  const { data, isLoading, isFetching } = useQuery(
    ["logs-siasn", router?.query],
    () => logSIASN(router?.query),
    {
      enabled: !!router?.query,
      keepPreviousData: true,
    }
  );

  const gotoDetail = (nip) => {
    router.push(`/rekon/pegawai/${nip}/detail`);
  };

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

  const handleSearch = (value) => {
    const searchValue = value?.trim() || undefined;
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        search: searchValue,
        page: 1,
      },
    });
  };

  const handleBulanChange = (date) => {
    const bulanValue = date ? dayjs(date).format("YYYY-MM") : undefined;
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        bulan: bulanValue,
        page: 1,
      },
    });
  };

  const handleMandiriChange = (checked) => {
    const mandiriValue = checked ? true : undefined;
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        mandiri: mandiriValue,
        page: 1,
      },
    });
  };

  const clearFilter = () => {
    const { bulan, search, mandiri, ...restQuery } = router.query;
    router.push({
      pathname: router.pathname,
      query: { ...restQuery, page: 1 },
    });
  };

  // Helper function untuk mendapatkan konfigurasi service
  const getServiceConfig = (service) => {
    const serviceMap = {
      PENGHARGAAN: {
        color: "gold",
        icon: "🏆",
        bgColor: "#fff7e6",
        borderColor: "#ffd666",
      },
      PEMBERHENTIAN: {
        color: "red",
        icon: "🚪",
        bgColor: "#fff2f0",
        borderColor: "#ffccc7",
      },
      PENGANGKATAN: {
        color: "green",
        icon: "📈",
        bgColor: "#f6ffed",
        borderColor: "#b7eb8f",
      },
      KENAIKAN_PANGKAT: {
        color: "blue",
        icon: "⬆️",
        bgColor: "#f0f5ff",
        borderColor: "#adc6ff",
      },
      MUTASI: {
        color: "purple",
        icon: "🔄",
        bgColor: "#f9f0ff",
        borderColor: "#d3adf7",
      },
      JABATAN: {
        color: "orange",
        icon: "👔",
        bgColor: "#fff7e6",
        borderColor: "#ffcc99",
      },
      DIKLAT: {
        color: "cyan",
        icon: "📚",
        bgColor: "#e6fffb",
        borderColor: "#87e8de",
      },
      HUKDIS: {
        color: "volcano",
        icon: "⚖️",
        bgColor: "#fff2e8",
        borderColor: "#ffbb96",
      },
      CUTI: {
        color: "lime",
        icon: "🏖️",
        bgColor: "#fcffe6",
        borderColor: "#eaff8f",
      },
      KGPAI: {
        color: "geekblue",
        icon: "💰",
        bgColor: "#f0f5ff",
        borderColor: "#adc6ff",
      },
    };

    const normalizedService = service?.toUpperCase() || "";
    return (
      serviceMap[normalizedService] || {
        color: "default",
        icon: "📄",
        bgColor: "#fafafa",
        borderColor: "#d9d9d9",
      }
    );
  };

  // Helper function untuk mendapatkan konfigurasi tipe
  const getTypeConfig = (type) => {
    const typeMap = {
      SAVE: { color: "success", icon: "💾", text: "Simpan" },
      UPDATE: { color: "processing", icon: "✏️", text: "Update" },
      DELETE: { color: "error", icon: "🗑️", text: "Hapus" },
      SYNC: { color: "warning", icon: "🔄", text: "Sinkronisasi" },
      UPLOAD: { color: "cyan", icon: "📤", text: "Upload" },
      DOWNLOAD: { color: "blue", icon: "📥", text: "Download" },
      VIEW: { color: "default", icon: "👁️", text: "Lihat" },
    };

    const normalizedType = type?.toUpperCase() || "";
    return (
      typeMap[normalizedType] || {
        color: "default",
        icon: "📋",
        text: type || "Unknown",
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
            👤 User yang Melakukan Aksi
          </Text>
        </Space>
      ),
      dataIndex: "user",
      key: "user",
      width: isMobile ? 240 : 340,
      render: (user, record) => (
        <div
          style={{
            padding: isMobile ? "8px" : "12px",
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
                size={isMobile ? 36 : 44}
                src={user?.image}
                style={{
                  background: user?.image
                    ? "transparent"
                    : "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                  border: "2px solid #fff",
                  boxShadow: "0 2px 8px rgba(255, 69, 0, 0.3)",
                }}
                icon={<UserOutlined />}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#52c41a",
                  border: "2px solid #fff",
                }}
              />
            </div>
            <Flex vertical gap={3} style={{ flex: 1 }}>
              <Flex align="center" gap={8} wrap>
                <Text
                  style={{
                    fontSize: isMobile ? "12px" : "14px",
                    fontWeight: 700,
                    color: "#1a1a1a",
                    lineHeight: 1.2,
                    maxWidth: isMobile ? "120px" : "180px",
                  }}
                  ellipsis={{ tooltip: user?.username }}
                >
                  {user?.username || record.user_id}
                </Text>
                {user?.role && (
                  <Tag
                    color="blue"
                    style={{
                      borderRadius: "8px",
                      fontSize: "9px",
                      fontWeight: 500,
                      padding: "1px 6px",
                      lineHeight: 1.2,
                    }}
                  >
                    {user.role}
                  </Tag>
                )}
              </Flex>
              {user?.employee_number && (
                <Flex align="center" gap={4}>
                  <Text
                    style={{
                      fontSize: isMobile ? "9px" : "11px",
                      color: "#666",
                      fontWeight: 500,
                    }}
                  >
                    NIP User:
                  </Text>
                  <Text
                    style={{
                      fontSize: isMobile ? "9px" : "11px",
                      color: "#1890ff",
                      fontFamily: "monospace",
                      fontWeight: 600,
                      backgroundColor: "#f0f5ff",
                      padding: "1px 4px",
                      borderRadius: "4px",
                    }}
                  >
                    {user.employee_number}
                  </Text>
                </Flex>
              )}
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
            <UserOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            🎯 Pegawai yang Diupdate
          </Text>
        </Space>
      ),
      dataIndex: "employee_number",
      key: "target_employee",
      width: isMobile ? 180 : 240,
      render: (employee_number, record) => (
        <div
          style={{
            padding: isMobile ? "8px" : "12px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #fff 0%, #f9f0ff 100%)",
            border: "1px solid #d3adf7",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#722ed1";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(114, 46, 209, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#d3adf7";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Flex align="center" gap={10}>
            <div
              style={{
                width: isMobile ? "32px" : "36px",
                height: isMobile ? "32px" : "36px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(114, 46, 209, 0.3)",
              }}
            >
              <UserOutlined style={{ color: "white", fontSize: "14px" }} />
            </div>
            <Flex vertical gap={2} style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: isMobile ? "10px" : "11px",
                  color: "#722ed1",
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                Target NIP:
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? "11px" : "12px",
                  color: "#1a1a1a",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  backgroundColor: "#f9f0ff",
                  padding: "2px 6px",
                  borderRadius: "6px",
                  border: "1px solid #d3adf7",
                }}
              >
                {employee_number || "N/A"}
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
              background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DatabaseOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            🔄 Aktivitas SIASN
          </Text>
        </Space>
      ),
      key: "aktivitas",
      width: isMobile ? 160 : 240,
      render: (_, record) => {
        const serviceConfig = getServiceConfig(record?.siasn_service);
        const typeConfig = getTypeConfig(record?.type);

        return (
          <div
            style={{
              padding: isMobile ? "8px" : "12px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
              border: "1px solid #e8e8e8",
              transition: "all 0.3s ease",
            }}
          >
            <Flex vertical gap={8}>
              {/* Service SIASN */}
              <Flex align="center" gap={6}>
                <Text
                  style={{
                    fontSize: isMobile ? "9px" : "10px",
                    color: "#666",
                    fontWeight: 500,
                    minWidth: "45px",
                  }}
                >
                  Service:
                </Text>
                <Tag
                  style={{
                    borderRadius: "16px",
                    fontSize: isMobile ? "9px" : "10px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    border: `1px solid ${serviceConfig.borderColor}`,
                    backgroundColor: serviceConfig.bgColor,
                    color: "#1a1a1a",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    maxWidth: "140px",
                  }}
                  icon={
                    <span style={{ fontSize: "10px" }}>
                      {serviceConfig.icon}
                    </span>
                  }
                >
                  {record?.siasn_service || "Unknown"}
                </Tag>
              </Flex>

              {/* Type */}
              <Flex align="center" gap={6}>
                <Text
                  style={{
                    fontSize: isMobile ? "9px" : "10px",
                    color: "#666",
                    fontWeight: 500,
                    minWidth: "45px",
                  }}
                >
                  Tipe:
                </Text>
                <Tag
                  color={typeConfig.color}
                  style={{
                    borderRadius: "16px",
                    fontSize: isMobile ? "9px" : "10px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  icon={
                    <span style={{ fontSize: "10px" }}>{typeConfig.icon}</span>
                  }
                >
                  {typeConfig.text}
                </Tag>
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
              borderRadius: "50%",
              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ClockCircleOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            ⏰ Waktu Aktivitas
          </Text>
        </Space>
      ),
      dataIndex: "created_at",
      key: "created_at",
      width: isMobile ? 110 : 140,
      render: (date) => (
        <div
          style={{
            padding: isMobile ? "8px" : "12px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
            border: "1px solid #e8e8e8",
            textAlign: "center",
            transition: "all 0.3s ease",
          }}
        >
          <Tooltip
            title={
              <div>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                  📅 {dayjs(date).format("dddd, DD MMMM YYYY")}
                </div>
                <div>🕐 {dayjs(date).format("HH:mm:ss")} WIB</div>
              </div>
            }
            overlayStyle={{ maxWidth: "200px" }}
          >
            <Flex vertical align="center" gap={4}>
              <div
                style={{
                  padding: "4px 8px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                  color: "white",
                  fontSize: isMobile ? "10px" : "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {dayjs(date).locale("id").fromNow()}
              </div>
              <Text
                style={{
                  fontSize: isMobile ? "9px" : "10px",
                  color: "#666",
                  fontWeight: 500,
                }}
              >
                {dayjs(date).format("DD/MM/YY • HH:mm")}
              </Text>
            </Flex>
          </Tooltip>
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
            <SearchOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            ⚡ Aksi
          </Text>
        </Space>
      ),
      key: "action",
      width: isMobile ? 90 : 120,
      align: "center",
      render: (_, record) => (
        <div
          style={{
            padding: isMobile ? "6px" : "8px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
            border: "1px solid #e8e8e8",
          }}
        >
          <Space direction={isMobile ? "horizontal" : "vertical"} size={6}>
            <Tooltip
              title={`Lihat detail pegawai NIP: ${record?.employee_number}`}
            >
              <Button
                type="primary"
                size="small"
                icon={<SearchOutlined />}
                onClick={() => gotoDetail(record?.employee_number)}
                disabled={!record?.employee_number}
                style={{
                  background: record?.employee_number
                    ? "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)"
                    : "linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%)",
                  borderColor: record?.employee_number ? "#FF4500" : "#d9d9d9",
                  fontSize: isMobile ? "10px" : "11px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  boxShadow: record?.employee_number
                    ? "0 2px 4px rgba(255, 69, 0, 0.3)"
                    : "0 2px 4px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (record?.employee_number) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 8px rgba(255, 69, 0, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (record?.employee_number) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 4px rgba(255, 69, 0, 0.3)";
                  }
                }}
              >
                {isMobile ? "📊" : "📊 Detail"}
              </Button>
            </Tooltip>
            <Tooltip title="Lihat detail request dan response data">
              <Button
                size="small"
                icon={<DatabaseOutlined />}
                onClick={() => showModalInformation(record)}
                style={{
                  borderColor: "#FF4500",
                  color: "#FF4500",
                  fontSize: isMobile ? "10px" : "11px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  backgroundColor: "#fff7e6",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FF4500";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff7e6";
                  e.currentTarget.style.color = "#FF4500";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {isMobile ? "📄" : "📄 Data"}
              </Button>
            </Tooltip>
          </Space>
        </div>
      ),
    },
    ...(isMobile
      ? []
      : [
          {
            title: (
              <Space>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    background:
                      "linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text strong style={{ color: "white", fontSize: "10px" }}>
                    #
                  </Text>
                </div>
                <Text strong style={{ color: "#1a1a1a" }}>
                  🏷️ ID Log
                </Text>
              </Space>
            ),
            dataIndex: "id",
            key: "id",
            width: 100,
            align: "center",
            render: (id) => (
              <div
                style={{
                  padding: "8px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
                  border: "1px solid #e8e8e8",
                  textAlign: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: "11px",
                    color: "#13c2c2",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    backgroundColor: "#e6fffb",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    border: "1px solid #87e8de",
                  }}
                >
                  #{id}
                </Text>
              </div>
            ),
          },
        ]),
  ];

  const { mutate: downloadLog, isLoading: isMutating } = useMutation({
    mutationFn: (data) => logSIASN(data),
    onSuccess: async (data) => {
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Log SIASN");

        worksheet.columns = [
          { header: "No", key: "no", width: 5 },
          { header: "ID Log", key: "id", width: 10 },
          { header: "Nama Pengguna", key: "username", width: 35 },
          { header: "NIP", key: "nip", width: 20 },
          { header: "Role", key: "role", width: 15 },
          { header: "Tipe", key: "type", width: 20 },
          { header: "Service SIASN", key: "siasn_service", width: 25 },
          { header: "Tanggal", key: "tanggal", width: 12 },
          { header: "Waktu", key: "waktu", width: 10 },
          { header: "Created At", key: "created_at", width: 20 },
        ];

        // Transform data untuk Excel
        const excelData =
          data?.data?.map((item, index) => ({
            no: index + 1,
            id: item?.id,
            username: item?.user?.username || item?.user_id,
            nip: item?.employee_number || "-",
            role: item?.user?.role || "-",
            type: item?.type,
            siasn_service: upperCase(item?.siasn_service),
            tanggal: dayjs(item?.created_at).format("DD/MM/YYYY"),
            waktu: dayjs(item?.created_at).format("HH:mm:ss"),
            created_at: item?.created_at,
          })) || [];

        excelData.forEach((item) => {
          worksheet.addRow(item);
        });

        // Styling header
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF4500" },
          };
          cell.alignment = { horizontal: "center", vertical: "center" };
        });

        const excelBuffer = await workbook.xlsx.writeBuffer();
        const excelBlob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const currentDate = dayjs().format("YYYY-MM-DD_HH-mm-ss");
        const bulanFilter = bulan
          ? `_${dayjs(bulan, "YYYY-MM").format("MMMM-YYYY")}`
          : "";
        const mandiriFilter = mandiri ? "_Mandiri" : "";
        const filename = `Log-SIASN_${currentDate}${bulanFilter}${mandiriFilter}.xlsx`;

        saveAs(excelBlob, filename);
        message.success("Berhasil mengunduh data Excel");
      } catch (error) {
        console.error("Error creating Excel file:", error);
        message.error("Gagal mengunduh data");
      }
    },
    onError: (error) => {
      console.error("Download error:", error);
      message.error("Gagal mengunduh data");
    },
  });

  const handleDownloadLog = () => {
    const payload = {
      ...router?.query,
      limit: -1,
    };
    downloadLog(payload);
  };

  return (
    <div
      style={{
        padding: isMobile ? "12px" : "20px",
        backgroundColor: "#fafafa",
        minHeight: "100vh",
      }}
    >
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
            <DatabaseOutlined
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
              📊 Riwayat Log SIASN
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "12px" : "14px" }}
            >
              Monitoring dan tracking aktivitas integrasi SIASN
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
        <Flex vertical gap={12}>
          <Flex align="center" gap={12} wrap justify="space-between">
            <Flex align="center" gap={12} wrap style={{ flex: 1 }}>
              <Flex align="center" gap={8}>
                <FilterOutlined
                  style={{ color: "#FF4500", fontSize: "16px" }}
                />
                <Text strong style={{ color: "#1a1a1a" }}>
                  Filter:
                </Text>
              </Flex>

              <Flex align="center" gap={8}>
                <CalendarOutlined style={{ color: "#666", fontSize: "14px" }} />
                <DatePicker
                  picker="month"
                  placeholder="Pilih Bulan"
                  value={bulan ? dayjs(bulan, "YYYY-MM") : null}
                  onChange={handleBulanChange}
                  style={{ width: isMobile ? 120 : 140 }}
                  format="MMMM YYYY"
                  allowClear={false}
                />
              </Flex>

              <Flex align="center" gap={8}>
                <SearchOutlined style={{ color: "#666", fontSize: "14px" }} />
                <Input.Search
                  placeholder="Cari berdasarkan nama pengguna..."
                  defaultValue={search}
                  onSearch={handleSearch}
                  style={{
                    width: isMobile ? 150 : 250,
                  }}
                  allowClear
                  enterButton={
                    <Button
                      type="primary"
                      style={{
                        backgroundColor: "#FF4500",
                        borderColor: "#FF4500",
                      }}
                    >
                      Cari
                    </Button>
                  }
                />
              </Flex>

              <Flex align="center" gap={8}>
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "4px",
                    background:
                      "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: "8px", fontWeight: 600 }}
                  >
                    ✓
                  </Text>
                </div>
                <Checkbox
                  checked={mandiri === "true"}
                  onChange={(e) => handleMandiriChange(e.target.checked)}
                  style={{
                    fontSize: isMobile ? "12px" : "14px",
                    fontWeight: 500,
                  }}
                >
                  <Text
                    style={{
                      color: "#1a1a1a",
                      fontSize: isMobile ? "12px" : "14px",
                      fontWeight: 500,
                    }}
                  >
                    Mandiri
                  </Text>
                </Checkbox>
              </Flex>

              {(bulan || search || mandiri) && (
                <Button
                  size="small"
                  onClick={clearFilter}
                  style={{
                    borderColor: "#FF4500",
                    color: "#FF4500",
                  }}
                >
                  Clear All
                </Button>
              )}
            </Flex>

            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadLog}
              loading={isMutating}
              style={{
                backgroundColor: "#FF4500",
                borderColor: "#FF4500",
                borderRadius: "6px",
                fontWeight: 500,
              }}
              size={isMobile ? "small" : "middle"}
            >
              {isMobile ? "Download" : "Download Excel"}
            </Button>
          </Flex>

          {/* Active Filter Tags */}
          {(bulan || search || mandiri) && (
            <Flex align="center" gap={8} wrap>
              {bulan && (
                <Tag
                  color="orange"
                  closable
                  onClose={() => {
                    const { bulan, ...restQuery } = router.query;
                    router.push({
                      pathname: router.pathname,
                      query: { ...restQuery, page: 1 },
                    });
                  }}
                  style={{
                    borderRadius: "12px",
                    fontSize: "11px",
                    padding: "2px 8px",
                  }}
                >
                  📅 {dayjs(bulan, "YYYY-MM").format("MMMM YYYY")}
                </Tag>
              )}

              {search && (
                <Tag
                  color="blue"
                  closable
                  onClose={() => {
                    const { search, ...restQuery } = router.query;
                    router.push({
                      pathname: router.pathname,
                      query: { ...restQuery, page: 1 },
                    });
                  }}
                  style={{
                    borderRadius: "12px",
                    fontSize: "11px",
                    padding: "2px 8px",
                  }}
                >
                  🔍 &quot;{search}&quot;
                </Tag>
              )}

              {mandiri && (
                <Tag
                  color="green"
                  closable
                  onClose={() => {
                    const { mandiri, ...restQuery } = router.query;
                    router.push({
                      pathname: router.pathname,
                      query: { ...restQuery, page: 1 },
                    });
                  }}
                  style={{
                    borderRadius: "12px",
                    fontSize: "11px",
                    padding: "2px 8px",
                  }}
                >
                  ✓ Mandiri
                </Tag>
              )}
            </Flex>
          )}
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
                {data.total?.toLocaleString()}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Total Log
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
                {data.data?.filter((item) => item.type === "UPDATE").length ||
                  0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Update
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
                {new Set(
                  data.data?.map((item) => item.employee_number).filter(Boolean)
                ).size || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Pegawai
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
                {new Set(
                  data.data?.map((item) => item.user?.username).filter(Boolean)
                ).size || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Admin
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
          dataSource={data?.data}
          columns={columns}
          loading={isLoading || isFetching}
          rowKey="id"
          size={isMobile ? "small" : "middle"}
          scroll={{ x: isMobile ? 700 : undefined }}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
          pagination={{
            current: parseInt(page),
            pageSize: parseInt(limit),
            total: data?.total,
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
                    aktivitas
                    {(bulan || search || mandiri) && (
                      <Text style={{ color: "#999" }}>
                        {" "}
                        {bulan &&
                          `(bulan ${dayjs(bulan, "YYYY-MM").format(
                            "MMMM YYYY"
                          )})`}
                        {bulan && (search || mandiri) && " • "}
                        {search && `(pencarian: "${search}")`}
                        {search && mandiri && " • "}
                        {mandiri && "(mandiri)"}
                      </Text>
                    )}
                  </>
                )}
              </Text>
            ),
            showSizeChanger: !isMobile,
            pageSizeOptions: ["10", "15", "20", "50"],
            simple: isMobile,
            onChange: handleChangePage,
            style: {
              marginTop: isMobile ? "12px" : "20px",
              padding: isMobile ? "8px 0" : "16px 0",
              borderTop: "1px solid #f0f0f0",
            },
          }}
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

        .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
          border-color: #ff4500 !important;
        }

        .ant-select-focused .ant-select-selector {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
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

        .ant-modal-header {
          border-radius: 8px 8px 0 0 !important;
        }

        .ant-collapse-header {
          font-weight: 500 !important;
        }

        .ant-collapse-content-box {
          padding: 16px !important;
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
};

export default LogSiasn;

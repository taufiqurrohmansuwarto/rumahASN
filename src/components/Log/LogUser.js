import { logUser } from "@/services/log.services";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  ChromeOutlined,
  CalendarOutlined,
  FilterOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  Table,
  Card,
  Typography,
  Tag,
  Flex,
  Avatar,
  Tooltip,
  Space,
  Grid,
  DatePicker,
  Button,
  message,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const LogUser = () => {
  const router = useRouter();
  const { page = 1, limit = 10, month } = router.query;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["log-user", page, limit, month],
    queryFn: () => logUser({ page, limit, month }),
    keepPreviousData: true,
  });

  const { mutate: downloadLog, isLoading: isMutating } = useMutation({
    mutationFn: (data) => logUser(data),
    onSuccess: (data) => {
      // Transform data untuk Excel
      const excelData =
        data?.map((item, index) => ({
          No: index + 1,
          "ID Log": item.id,
          "Nama Pengguna": item.user?.username || item.user_id,
          NIP: item.user?.employee_number || "-",
          Aksi:
            item.action === "login"
              ? "Login"
              : item.action === "logout"
              ? "Logout"
              : "Aktivitas",
          Tipe: item.type,
          "IP Address": item.ip_address || "N/A",
          Browser: getBrowserInfo(item.user_agent).name,
          "User Agent": item.user_agent || "N/A",
          Tanggal: dayjs(item.created_at).format("DD/MM/YYYY"),
          Waktu: dayjs(item.created_at).format("HH:mm:ss"),
          "Tanggal Lengkap": dayjs(item.created_at).format(
            "DD MMMM YYYY, HH:mm:ss"
          ),
          "Ticket ID": item.ticket_id || "-",
          "Created At": item.created_at,
          "Updated At": item.updated_at,
        })) || [];

      // Buat workbook baru
      const workbook = XLSX.utils.book_new();

      // Buat worksheet dari data
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 5 }, // No
        { wch: 10 }, // ID Log
        { wch: 30 }, // Nama Pengguna
        { wch: 20 }, // NIP
        { wch: 10 }, // Aksi
        { wch: 12 }, // Tipe
        { wch: 18 }, // IP Address
        { wch: 12 }, // Browser
        { wch: 50 }, // User Agent
        { wch: 12 }, // Tanggal
        { wch: 10 }, // Waktu
        { wch: 25 }, // Tanggal Lengkap
        { wch: 12 }, // Ticket ID
        { wch: 20 }, // Created At
        { wch: 20 }, // Updated At
      ];
      worksheet["!cols"] = columnWidths;

      // Set header styling
      const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          font: {
            bold: true,
            color: { rgb: "FFFFFF" },
            size: 12,
            name: "Calibri",
          },
          fill: {
            fgColor: { rgb: "FF4500" },
            patternType: "solid",
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
          border: {
            top: { style: "medium", color: { rgb: "FFFFFF" } },
            bottom: { style: "medium", color: { rgb: "FFFFFF" } },
            left: { style: "thin", color: { rgb: "FFFFFF" } },
            right: { style: "thin", color: { rgb: "FFFFFF" } },
          },
        };
      }

      // Set alternating row colors for better readability
      const dataRange = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let row = 1; row <= dataRange.e.r; row++) {
        for (let col = dataRange.s.c; col <= dataRange.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cellAddress]) continue;

          // Alternating row colors
          const isEvenRow = row % 2 === 0;
          worksheet[cellAddress].s = {
            font: {
              color: { rgb: "1A1A1A" },
              size: 10,
              name: "Calibri",
            },
            fill: {
              fgColor: { rgb: isEvenRow ? "F8F9FA" : "FFFFFF" },
              patternType: "solid",
            },
            alignment: {
              horizontal: col === 0 ? "center" : "left", // Center for No column
              vertical: "center",
              wrapText: col === 8, // Wrap text for User Agent column
            },
            border: {
              top: { style: "thin", color: { rgb: "E8E8E8" } },
              bottom: { style: "thin", color: { rgb: "E8E8E8" } },
              left: { style: "thin", color: { rgb: "E8E8E8" } },
              right: { style: "thin", color: { rgb: "E8E8E8" } },
            },
          };

          // Special styling for specific columns
          if (col === 4) {
            // Aksi column
            const cellValue = worksheet[cellAddress].v;
            if (cellValue === "Login") {
              worksheet[cellAddress].s.font.color = { rgb: "52C41A" };
              worksheet[cellAddress].s.font.bold = true;
            } else if (cellValue === "Logout") {
              worksheet[cellAddress].s.font.color = { rgb: "FF4D4F" };
              worksheet[cellAddress].s.font.bold = true;
            }
          }
        }
      }

      // Freeze first row (header)
      worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

      // Set print settings
      worksheet["!margins"] = {
        left: 0.7,
        right: 0.7,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      };

      // Auto filter
      worksheet["!autofilter"] = { ref: worksheet["!ref"] };

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Log Aktivitas");

      // Generate filename with current date and filter info
      const currentDate = dayjs().format("YYYY-MM-DD_HH-mm-ss");
      const monthFilter = month
        ? `_${dayjs(month, "YYYY-MM").format("MMMM-YYYY")}`
        : "";
      const filename = `Log-Aktivitas-Pengguna_${currentDate}${monthFilter}.xlsx`;

      // Write and download
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const excelBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(excelBlob, filename);
      message.success("Berhasil mengunduh data Excel");
    },
    onError: (error) => {
      console.error("Download error:", error);
      message.error("Gagal mengunduh data");
    },
  });

  const handleDownloadLog = () => {
    downloadLog({ ...router.query, limit: -1 });
  };

  const getBrowserInfo = (userAgent) => {
    if (!userAgent) return { name: "Unknown", icon: "🌐" };

    if (userAgent.includes("Firefox")) return { name: "Firefox", icon: "🦊" };
    if (userAgent.includes("Chrome")) return { name: "Chrome", icon: "🌐" };
    if (userAgent.includes("Safari")) return { name: "Safari", icon: "🧭" };
    if (userAgent.includes("Edge")) return { name: "Edge", icon: "📘" };
    return { name: "Other", icon: "💻" };
  };

  const handleMonthChange = (date) => {
    const monthValue = date ? dayjs(date).format("YYYY-MM") : undefined;
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        month: monthValue,
        page: 1, // Reset to first page when filtering
      },
    });
  };

  const clearFilter = () => {
    const { month, ...restQuery } = router.query;
    router.push({
      pathname: router.pathname,
      query: { ...restQuery, page: 1 },
    });
  };

  const columns = [
    {
      title: (
        <Space>
          <UserOutlined />
          <Text strong>Aksi</Text>
        </Space>
      ),
      dataIndex: "action",
      key: "action",
      width: isMobile ? 80 : 120,
      align: "center",
      render: (action) => {
        const getActionConfig = (action) => {
          switch (action) {
            case "login":
              return {
                color: "success",
                icon: <LoginOutlined style={{ fontSize: "12px" }} />,
                text: "Login",
                bgColor: "#f6ffed",
                borderColor: "#b7eb8f",
              };
            case "logout":
              return {
                color: "error",
                icon: <LogoutOutlined style={{ fontSize: "12px" }} />,
                text: "Logout",
                bgColor: "#fff2f0",
                borderColor: "#ffccc7",
              };
            default:
              return {
                color: "default",
                icon: <UserOutlined style={{ fontSize: "12px" }} />,
                text: "Aktivitas",
                bgColor: "#fafafa",
                borderColor: "#d9d9d9",
              };
          }
        };

        const config = getActionConfig(action);
        return (
          <Tag
            color={config.color}
            icon={!isMobile ? config.icon : null}
            style={{
              borderRadius: "16px",
              padding: isMobile ? "2px 8px" : "4px 12px",
              fontSize: isMobile ? "10px" : "12px",
              fontWeight: 500,
              border: `1px solid ${config.borderColor}`,
              backgroundColor: config.bgColor,
            }}
          >
            {isMobile ? config.text.substring(0, 3) : config.text}
          </Tag>
        );
      },
    },
    {
      title: (
        <Space>
          <Avatar
            size={16}
            style={{ backgroundColor: "#FF4500" }}
            icon={<UserOutlined />}
          />
          <Text strong>Pengguna</Text>
        </Space>
      ),
      dataIndex: "user",
      key: "user",
      width: isMobile ? 200 : 280,
      render: (user, record) => (
        <Flex align="center" gap={8}>
          <Avatar
            size={isMobile ? 32 : 40}
            src={user?.image}
            style={{ backgroundColor: "#FF4500" }}
            icon={<UserOutlined />}
          />
          <Flex vertical gap={2}>
            <Text
              style={{
                fontSize: isMobile ? "11px" : "13px",
                fontWeight: 600,
                color: "#1a1a1a",
                lineHeight: 1.2,
              }}
              ellipsis={{ tooltip: user?.username }}
            >
              {user?.username || record.user_id}
            </Text>
            {user?.employee_number && (
              <Text
                style={{
                  fontSize: isMobile ? "9px" : "11px",
                  color: "#666",
                  fontFamily: "monospace",
                }}
              >
                NIP: {user.employee_number}
              </Text>
            )}
          </Flex>
        </Flex>
      ),
    },
    ...(isMobile
      ? []
      : [
          {
            title: (
              <Space>
                <GlobalOutlined />
                <Text strong>IP Address</Text>
              </Space>
            ),
            dataIndex: "ip_address",
            key: "ip_address",
            width: 140,
            render: (ip) => {
              const isLocalhost =
                ip &&
                (ip.includes("127.0.0.1") || ip.includes("::ffff:127.0.0.1"));
              return (
                <Tooltip title={ip || "IP Address tidak tersedia"}>
                  <Tag
                    color={ip ? (isLocalhost ? "orange" : "blue") : "default"}
                    style={{
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                  >
                    {isLocalhost ? "🏠 Localhost" : ip || "N/A"}
                  </Tag>
                </Tooltip>
              );
            },
          },
          {
            title: (
              <Space>
                <ChromeOutlined />
                <Text strong>Browser</Text>
              </Space>
            ),
            dataIndex: "user_agent",
            key: "user_agent",
            width: 120,
            render: (userAgent) => {
              const browser = getBrowserInfo(userAgent);
              return (
                <Tooltip title={userAgent || "User Agent tidak tersedia"}>
                  <Tag
                    style={{
                      borderRadius: "12px",
                      fontSize: "11px",
                      padding: "2px 8px",
                      backgroundColor: "#f0f8ff",
                      border: "1px solid #d6e4ff",
                      color: "#1890ff",
                    }}
                  >
                    {browser.icon} {browser.name}
                  </Tag>
                </Tooltip>
              );
            },
          },
        ]),
    {
      title: (
        <Space>
          <ClockCircleOutlined />
          <Text strong>Waktu</Text>
        </Space>
      ),
      dataIndex: "created_at",
      key: "created_at",
      width: isMobile ? 100 : 140,
      render: (date) => (
        <Tooltip title={dayjs(date).format("DD MMMM YYYY, HH:mm:ss")}>
          <Flex align="center" gap={4} vertical={isMobile}>
            {!isMobile && (
              <ClockCircleOutlined
                style={{ color: "#FF4500", fontSize: "12px" }}
              />
            )}
            <Text
              style={{
                fontSize: isMobile ? "10px" : "12px",
                color: "#FF4500",
                fontWeight: 500,
                cursor: "pointer",
                textAlign: isMobile ? "center" : "left",
              }}
            >
              {dayjs(date).locale("id").fromNow()}
            </Text>
            {isMobile && (
              <Text
                style={{
                  fontSize: "9px",
                  color: "#999",
                  textAlign: "center",
                }}
              >
                {dayjs(date).format("DD/MM HH:mm")}
              </Text>
            )}
          </Flex>
        </Tooltip>
      ),
    },
    ...(isMobile
      ? []
      : [
          {
            title: <Text strong>ID</Text>,
            dataIndex: "id",
            key: "id",
            width: 80,
            align: "center",
            render: (id) => (
              <Text
                style={{
                  fontSize: "11px",
                  color: "#999",
                  fontFamily: "monospace",
                  backgroundColor: "#f5f5f5",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                #{id}
              </Text>
            ),
          },
        ]),
  ];

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
            <UserOutlined
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
              📋 Log Aktivitas Pengguna
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "12px" : "14px" }}
            >
              Riwayat aktivitas login dan logout pengguna sistem
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
        <Flex align="center" gap={12} wrap justify="space-between">
          <Flex align="center" gap={12} wrap>
            <Flex align="center" gap={8}>
              <FilterOutlined style={{ color: "#FF4500", fontSize: "16px" }} />
              <Text strong style={{ color: "#1a1a1a" }}>
                Filter:
              </Text>
            </Flex>

            <Flex align="center" gap={8}>
              <CalendarOutlined style={{ color: "#666", fontSize: "14px" }} />
              <DatePicker
                picker="month"
                placeholder="Pilih Bulan"
                value={month ? dayjs(month, "YYYY-MM") : null}
                onChange={handleMonthChange}
                style={{ width: isMobile ? 140 : 160 }}
                format="MMMM YYYY"
                allowClear={false}
              />
            </Flex>

            {month && (
              <Button
                size="small"
                onClick={clearFilter}
                style={{
                  borderColor: "#FF4500",
                  color: "#FF4500",
                }}
              >
                Clear Filter
              </Button>
            )}

            {month && (
              <Tag
                color="orange"
                style={{
                  borderRadius: "12px",
                  fontSize: "11px",
                  padding: "2px 8px",
                }}
              >
                📅 {dayjs(month, "YYYY-MM").format("MMMM YYYY")}
              </Tag>
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
                {data.data?.filter((item) => item.action === "login").length ||
                  0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Login
              </Text>
            </Flex>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#ff4d4f",
                }}
              >
                {data.data?.filter((item) => item.action === "logout").length ||
                  0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Logout
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
          scroll={{ x: isMobile ? 600 : undefined }}
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
                    {month && (
                      <Text style={{ color: "#999" }}>
                        {" "}
                        (bulan {dayjs(month, "YYYY-MM").format("MMMM YYYY")})
                      </Text>
                    )}
                  </>
                )}
              </Text>
            ),
            showSizeChanger: !isMobile,
            pageSizeOptions: ["10", "20", "50"],
            simple: isMobile,
            onChange: (newPage, newPageSize) => {
              router.push({
                pathname: router.pathname,
                query: { ...router.query, page: newPage, limit: newPageSize },
              });
            },
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

export default LogUser;

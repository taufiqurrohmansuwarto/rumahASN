import { logUser } from "@/services/log.services";
import {
  DatabaseOutlined,
  DownloadOutlined,
  LoginOutlined,
  LogoutOutlined,
  ReloadOutlined,
  UserOutlined,
  GlobalOutlined,
  ChromeOutlined,
} from "@ant-design/icons";
import { Text, Badge } from "@mantine/core";
import {
  IconLogin,
  IconLogout,
  IconUser,
  IconWorld,
  IconBrandChrome,
  IconBrandFirefox,
  IconBrandSafari,
  IconBrandEdge,
  IconDeviceDesktop
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Modal,
  Row,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { upperCase } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

dayjs.extend(relativeTime);

const { Title } = Typography;

const LogUser = () => {
  const router = useRouter();
  const { page = 1, limit = 15, month } = router.query;

  const { data, isLoading, isFetching, refetch, isRefetching } = useQuery({
    queryKey: ["log-user", router?.query],
    queryFn: () => logUser(router?.query),
    enabled: !!router?.query,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
    if (!userAgent) return { name: "Unknown", icon: <IconDeviceDesktop size={12} /> };

    if (userAgent.includes("Firefox")) return { name: "Firefox", icon: <IconBrandFirefox size={12} /> };
    if (userAgent.includes("Chrome")) return { name: "Chrome", icon: <IconBrandChrome size={12} /> };
    if (userAgent.includes("Safari")) return { name: "Safari", icon: <IconBrandSafari size={12} /> };
    if (userAgent.includes("Edge")) return { name: "Edge", icon: <IconBrandEdge size={12} /> };
    return { name: "Other", icon: <IconDeviceDesktop size={12} /> };
  };

  const handleMonthChange = (date) => {
    const monthValue = date ? dayjs(date).format("YYYY-MM") : undefined;
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        month: monthValue,
        page: 1,
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
      title: "Pengguna",
      key: "user",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Avatar
            src={record.user?.image}
            size={36}
            style={{
              border: "2px solid #f0f0f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            {!record.user?.image && <UserOutlined />}
          </Avatar>
          <div style={{ lineHeight: "1.1" }}>
            <div>
              <Text fw={600} size="xs">{record.user?.username || record.user_id}</Text>
            </div>
            {record.user?.employee_number && (
              <div style={{ marginTop: "0px" }}>
                <Text size="10px" c="dimmed">
                  {record.user.employee_number}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Aksi",
      dataIndex: "action",
      key: "action",
      width: 100,
      render: (action) => {
        const actionConfig = {
          login: { color: "green", icon: <IconLogin size={12} /> },
          logout: { color: "red", icon: <IconLogout size={12} /> },
        };
        const config = actionConfig[action] || { color: "blue", icon: <IconUser size={12} /> };
        return (
          <Badge
            color={config.color}
            size="sm"
            variant="light"
            leftSection={<div style={{ display: "flex", alignItems: "center" }}>{config.icon}</div>}
            styles={{
              section: { display: "flex", alignItems: "center" },
              label: { display: "flex", alignItems: "center" }
            }}
          >
            {action?.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      title: "IP Address",
      dataIndex: "ip_address",
      key: "ip_address",
      width: 140,
      render: (ip) => {
        const isLocalhost = ip && (ip.includes("127.0.0.1") || ip.includes("::ffff:127.0.0.1"));
        return (
          <Badge
            color={isLocalhost ? "orange" : "blue"}
            size="sm"
            variant="outline"
            leftSection={<div style={{ display: "flex", alignItems: "center" }}><IconWorld size={12} /></div>}
            styles={{
              section: { display: "flex", alignItems: "center" },
              label: { display: "flex", alignItems: "center" }
            }}
          >
            {isLocalhost ? "LOCALHOST" : ip || "N/A"}
          </Badge>
        );
      },
    },
    {
      title: "Browser",
      dataIndex: "user_agent",
      key: "user_agent",
      width: 120,
      render: (userAgent) => {
        const browser = getBrowserInfo(userAgent);
        return (
          <Badge
            size="sm"
            variant="outline"
            leftSection={<div style={{ display: "flex", alignItems: "center" }}>{browser.icon}</div>}
            styles={{
              section: { display: "flex", alignItems: "center" },
              label: { display: "flex", alignItems: "center" }
            }}
          >
            {browser.name?.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      title: "Waktu",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (text) => (
        <Tooltip title={dayjs(text).format("DD-MM-YYYY HH:mm:ss")}>
          <div style={{ lineHeight: "1.1", cursor: "pointer" }}>
            <Text size="xs">{dayjs(text).format("DD/MM/YY")}</Text>
            <div style={{ marginTop: "0px" }}>
              <Text size="10px" c="dimmed">
                {dayjs(text).format("HH:mm")}
              </Text>
            </div>
          </div>
        </Tooltip>
      ),
    },
  ];

  const tableData = data?.data || [];

  return (
    <div>
      <div style={{ maxWidth: "100%" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              background: "#FF4500",
              color: "white",
              padding: "24px",
              textAlign: "center",
              borderRadius: "12px 12px 0 0",
              margin: "-24px -24px 0 -24px",
            }}
          >
            <UserOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Log User
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
              Monitoring aktivitas login dan logout pengguna
            </Text>
          </div>

          {/* Filter and Actions Section */}
          <div style={{ padding: "20px 0 16px 0", borderBottom: "1px solid #f0f0f0" }}>
            <Row gutter={16} align="middle" justify="space-between">
              <Col>
                <Space>
                  <Text fw={600} size="sm" c="dimmed">Filter Bulan:</Text>
                  <DatePicker
                    placeholder="Pilih Bulan"
                    picker="month"
                    value={month ? dayjs(month, "YYYY-MM") : null}
                    onChange={handleMonthChange}
                    allowClear
                    style={{ width: "160px" }}
                  />
                  {month && (
                    <Button
                      type="text"
                      onClick={clearFilter}
                      style={{
                        color: "#FF4500",
                        fontWeight: "500",
                        padding: "4px 8px"
                      }}
                    >
                      Clear Filter
                    </Button>
                  )}
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    loading={isLoading || isRefetching}
                    onClick={() => refetch()}
                    style={{
                      borderRadius: "6px",
                      fontWeight: "500",
                    }}
                  >
                    Refresh
                  </Button>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    loading={isMutating}
                    onClick={handleDownloadLog}
                    style={{
                      background: "#FF4500",
                      borderColor: "#FF4500",
                      borderRadius: "6px",
                      fontWeight: "500",
                    }}
                  >
                    Unduh Data
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>

          {/* Table Section */}
          <div style={{ marginTop: "16px" }}>
            <Table
              columns={columns}
              dataSource={tableData}
              rowKey="id"
              loading={isLoading || isFetching}
              scroll={{ x: 680 }}
              size="middle"
              style={{
                borderRadius: "12px",
                overflow: "hidden",
              }}
              pagination={{
                position: ["bottomRight"],
                total: data?.total || 0,
                pageSize: parseInt(limit),
                current: parseInt(page),
                showSizeChanger: false,
                onChange: (newPage, newPageSize) => {
                  router.push({
                    pathname: router.pathname,
                    query: { ...router.query, page: newPage, limit: newPageSize },
                  });
                },
                showTotal: (total, range) =>
                  `${range[0].toLocaleString('id-ID')}-${range[1].toLocaleString('id-ID')} dari ${total.toLocaleString('id-ID')} records`,
                style: { margin: "16px 0" },
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: "60px", textAlign: "center" }}>
                    <UserOutlined
                      style={{ fontSize: 64, color: "#d1d5db", marginBottom: 24 }}
                    />
                    <div>
                      <Text size="lg" c="dimmed">
                        Tidak ada data log
                      </Text>
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      <Text size="sm" c="dimmed">
                        Belum ada aktivitas yang tercatat
                      </Text>
                    </div>
                  </div>
                ),
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LogUser;

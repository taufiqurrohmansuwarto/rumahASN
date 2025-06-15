import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  SendOutlined,
  TagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Flex, Grid, Input, Space, Table, Tag, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { getAllTickets } from "../../services/users.services";
import { formatDate } from "../../utils";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

const CustomersTickets = ({ status = "all", title = "Semua Tiket" }) => {
  const [query, setQuery] = useState({
    page: 1,
    limit: 50,
    status,
  });

  const router = useRouter();
  const screens = useBreakpoint();

  // Responsive variables
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const iconSectionWidth = isMobile ? "0px" : "40px";
  const mainPadding = isMobile ? "12px" : isTablet ? "14px" : "16px";
  const headerPadding = isMobile ? "16px" : isTablet ? "18px" : "20px";
  const tablePadding = isMobile ? "8px" : isTablet ? "12px" : "16px";
  const { data, isLoading } = useQuery(
    ["user-tickets", query],
    () => getAllTickets(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const handleSearch = (e) => {
    setQuery({
      ...query,
      page: 1,
      search: e.target.value,
    });
  };

  // Status configuration with icons and colors
  const getStatusConfig = (statusCode) => {
    switch (statusCode) {
      case "DIAJUKAN":
        return {
          color: "#FF4500",
          bgColor: "#FFF7E6",
          borderColor: "#FFD591",
          icon: <SendOutlined />,
          text: "Diajukan",
        };
      case "DIKERJAKAN":
        return {
          color: "#1890FF",
          bgColor: "#E6F7FF",
          borderColor: "#91D5FF",
          icon: <ClockCircleOutlined />,
          text: "Dikerjakan",
        };
      case "SELESAI":
        return {
          color: "#52C41A",
          bgColor: "#F6FFED",
          borderColor: "#B7EB8F",
          icon: <CheckCircleOutlined />,
          text: "Selesai",
        };
      default:
        return {
          color: "#9CA3AF",
          bgColor: "#F9FAFB",
          borderColor: "#E5E7EB",
          icon: <ExclamationCircleOutlined />,
          text: statusCode || "Unknown",
        };
    }
  };

  const columns = [
    {
      title: "📋 Informasi Tiket",
      key: "ticket_info",
      render: (record) => {
        const statusConfig = getStatusConfig(record?.status_code);
        return (
          <div
            style={{
              maxWidth: isMobile ? "220px" : isTablet ? "300px" : "400px",
              minWidth: isMobile ? "180px" : "250px",
            }}
          >
            {/* Title */}
            <Text
              strong
              style={{
                fontSize: isMobile ? "13px" : isTablet ? "14px" : "16px",
                color: "#1C1C1C",
                display: "block",
                marginBottom: isMobile ? "4px" : "6px",
                lineHeight: "1.4",
                wordBreak: "break-word",
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitLineClamp: isMobile ? 2 : 3,
                WebkitBoxOrient: "vertical",
                display: "-webkit-box",
              }}
              title={record?.title} // Tooltip untuk teks yang terpotong
            >
              {record?.title}
            </Text>

            {/* Ticket Number with icon */}
            <div style={{ marginBottom: isMobile ? "6px" : "8px" }}>
              <Tag
                icon={<TagOutlined />}
                style={{
                  backgroundColor: "#F8F9FA",
                  color: "#6B7280",
                  border: "1px solid #E5E7EB",
                  borderRadius: isMobile ? "4px" : "6px",
                  fontSize: isMobile ? "10px" : "12px",
                  fontWeight: 500,
                  padding: isMobile ? "2px 6px" : "2px 8px",
                }}
              >
                {record?.ticket_number}
              </Tag>
            </div>

            {/* Status Badge */}
            <div
              style={{
                padding: isMobile
                  ? "3px 8px"
                  : isTablet
                  ? "4px 9px"
                  : "4px 10px",
                borderRadius: isMobile ? "4px" : "6px",
                backgroundColor: statusConfig.bgColor,
                border: `1px solid ${statusConfig.borderColor}`,
                display: "inline-flex",
                alignItems: "center",
                gap: isMobile ? "4px" : "6px",
                fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                fontWeight: 500,
                color: statusConfig.color,
              }}
            >
              <span style={{ fontSize: isMobile ? "10px" : "12px" }}>
                {statusConfig.icon}
              </span>
              <span>{statusConfig.text}</span>
            </div>
          </div>
        );
      },
      responsive: ["xs", "sm", "md", "lg", "xl"],
      width: isMobile ? "65%" : isTablet ? "50%" : "40%",
    },
    {
      title: "📅 Timeline",
      key: "timeline",
      render: (_, record) => {
        return (
          <Space direction="vertical" size={isMobile ? 2 : 4}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "4px" : "6px",
                flexWrap: isMobile ? "wrap" : "nowrap",
              }}
            >
              <CalendarOutlined
                style={{
                  color: "#9CA3AF",
                  fontSize: isMobile ? "10px" : "12px",
                  flexShrink: 0,
                }}
              />
              <Text
                style={{
                  fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                  color: "#6B7280",
                  lineHeight: "1.3",
                  wordBreak: "break-word",
                }}
              >
                Dibuat: {formatDate(record.created_at)}
              </Text>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "4px" : "6px",
                flexWrap: isMobile ? "wrap" : "nowrap",
              }}
            >
              <ClockCircleOutlined
                style={{
                  color: "#9CA3AF",
                  fontSize: isMobile ? "10px" : "12px",
                  flexShrink: 0,
                }}
              />
              <Text
                style={{
                  fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                  color: "#6B7280",
                  lineHeight: "1.3",
                  wordBreak: "break-word",
                }}
              >
                Update: {formatDate(record.updated_at)}
              </Text>
            </div>
          </Space>
        );
      },
      responsive: isMobile ? ["lg", "xl"] : ["md", "lg", "xl"],
      width: isMobile ? "0%" : isTablet ? "30%" : "25%",
    },
    {
      title: "🎯 Aksi",
      key: "actions",
      render: (_, record) => {
        return (
          <Space size="small">
            <Link href={`/tickets/${record?.id}/detail`}>
              <Button
                type="primary"
                size={isMobile ? "small" : "middle"}
                icon={<EyeOutlined />}
                style={{
                  backgroundColor: "#FF4500",
                  borderColor: "#FF4500",
                  borderRadius: isMobile ? "4px" : "6px",
                  fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                  height: isMobile ? "24px" : isTablet ? "26px" : "28px",
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "2px" : "4px",
                  padding: isMobile ? "0 6px" : "0 8px",
                  minWidth: isMobile ? "auto" : "60px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#E63900";
                  e.currentTarget.style.borderColor = "#E63900";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FF4500";
                  e.currentTarget.style.borderColor = "#FF4500";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {isMobile ? "" : "Detail"}
              </Button>
            </Link>
          </Space>
        );
      },
      align: "center",
      width: isMobile ? "25%" : isTablet ? "20%" : "15%",
    },
  ];

  const createTicket = () => {
    router.push("/tickets/create");
  };

  return (
    <>
      <Flex>
        {/* Icon Section - Hide on mobile */}
        {!isMobile && (
          <div
            style={{
              width: iconSectionWidth,
              backgroundColor: "#F8F9FA",
              borderRight: "1px solid #E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "400px",
            }}
          >
            <UserOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
          </div>
        )}

        {/* Content Section */}
        <div style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          {/* Header Section */}
          <div
            style={{
              padding: headerPadding,
              paddingBottom: isMobile ? "12px" : isTablet ? "14px" : "16px",
              borderBottom: "1px solid #F3F4F6",
              backgroundColor: "#FAFBFC",
            }}
          >
            <Title
              level={isMobile ? 5 : 4}
              style={{
                margin: 0,
                marginBottom: isMobile ? "12px" : isTablet ? "14px" : "16px",
                color: "#1C1C1C",
                fontSize: isMobile ? "16px" : isTablet ? "17px" : "18px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: isMobile ? "6px" : "8px",
                lineHeight: isMobile ? "1.3" : "1.4",
              }}
            >
              🎫 {title}
            </Title>

            {/* Search Section */}
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "8px" : "12px",
                alignItems: isMobile ? "stretch" : "center",
              }}
            >
              <Input.Search
                style={{
                  width: isMobile ? "100%" : isTablet ? "350px" : "400px",
                  maxWidth: "100%",
                }}
                placeholder={
                  isMobile
                    ? "Cari tiket..."
                    : "Cari tiket berdasarkan judul atau nomor..."
                }
                onChange={handleSearch}
                size={isMobile ? "middle" : "large"}
                allowClear
              />

              {/* Statistics Info */}
              <div
                style={{
                  color: "#6B7280",
                  fontSize: isMobile ? "12px" : "13px",
                  whiteSpace: "nowrap",
                  alignSelf: isMobile ? "flex-start" : "center",
                }}
              >
                Total: {data?.total || 0} tiket
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div
            style={{
              padding: tablePadding,
              backgroundColor: "#FFFFFF",
            }}
          >
            <Table
              pagination={{
                total: data?.total,
                position: isMobile ? ["bottomCenter"] : ["bottomRight"],
                current: query?.page,
                pageSize: 50,
                showTotal: (total, range) =>
                  isMobile
                    ? `${range[0]}-${range[1]} dari ${total}`
                    : `${range[0]}-${range[1]} dari ${total} tiket`,
                onChange: (page, limit) => {
                  setQuery({
                    ...query,
                    page,
                    limit,
                  });
                },
                size: isMobile ? "small" : "default",
                showSizeChanger: false,
                responsive: true,
                style: {
                  padding: isMobile ? "8px 0" : "16px 0",
                  textAlign: isMobile ? "center" : "right",
                },
              }}
              columns={columns}
              rowKey={(row) => row?.id}
              loading={isLoading}
              dataSource={data?.results}
              size={isMobile ? "small" : "middle"}
              scroll={{
                x: isMobile ? 600 : isTablet ? 800 : false,
                scrollToFirstRowOnChange: true,
              }}
              rowClassName={(record, index) =>
                index % 2 === 0 ? "table-row-even" : "table-row-odd"
              }
              locale={{
                emptyText: (
                  <div
                    style={{
                      padding: isMobile ? "20px" : "40px",
                      textAlign: "center",
                      color: "#9CA3AF",
                    }}
                  >
                    <div
                      style={{
                        fontSize: isMobile ? "24px" : "32px",
                        marginBottom: "8px",
                      }}
                    >
                      📄
                    </div>
                    <div
                      style={{
                        fontSize: isMobile ? "14px" : "16px",
                        color: "#6B7280",
                      }}
                    >
                      Tidak ada tiket ditemukan
                    </div>
                  </div>
                ),
              }}
            />
          </div>

          {/* Custom CSS untuk table styling */}
          <style jsx global>{`
            .table-row-even {
              background-color: #fafbfc !important;
            }
            .table-row-odd {
              background-color: #ffffff !important;
            }
            .table-row-even:hover,
            .table-row-odd:hover {
              background-color: #f3f4f6 !important;
            }
          `}</style>
        </div>
      </Flex>
    </>
  );
};

export default CustomersTickets;

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
  const isMobile = !screens.md;

  // Responsive variables
  const iconSectionWidth = isMobile ? "0px" : "40px";
  const mainPadding = isMobile ? "12px" : "16px";
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
          <div style={{ maxWidth: isMobile ? "250px" : "400px" }}>
            {/* Title */}
            <Text
              strong
              style={{
                fontSize: isMobile ? "14px" : "16px",
                color: "#1C1C1C",
                display: "block",
                marginBottom: "6px",
                lineHeight: "1.4",
                wordBreak: "break-word",
              }}
            >
              {record?.title}
            </Text>

            {/* Ticket Number with icon */}
            <div style={{ marginBottom: "8px" }}>
              <Tag
                icon={<TagOutlined />}
                style={{
                  backgroundColor: "#F8F9FA",
                  color: "#6B7280",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                {record?.ticket_number}
              </Tag>
            </div>

            {/* Status Badge */}
            <div
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                backgroundColor: statusConfig.bgColor,
                border: `1px solid ${statusConfig.borderColor}`,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 500,
                color: statusConfig.color,
              }}
            >
              {statusConfig.icon}
              <span>{statusConfig.text}</span>
            </div>
          </div>
        );
      },
      responsive: ["xs", "sm", "md", "lg", "xl"],
      width: isMobile ? "60%" : "40%",
    },
    {
      title: "📅 Timeline",
      key: "timeline",
      render: (_, record) => {
        return (
          <Space direction="vertical" size={4}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <CalendarOutlined
                style={{ color: "#9CA3AF", fontSize: "12px" }}
              />
              <Text style={{ fontSize: "12px", color: "#6B7280" }}>
                Dibuat: {formatDate(record.created_at)}
              </Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ClockCircleOutlined
                style={{ color: "#9CA3AF", fontSize: "12px" }}
              />
              <Text style={{ fontSize: "12px", color: "#6B7280" }}>
                Update: {formatDate(record.updated_at)}
              </Text>
            </div>
          </Space>
        );
      },
      responsive: ["md", "lg", "xl"],
      width: "25%",
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
                size="small"
                icon={<EyeOutlined />}
                style={{
                  backgroundColor: "#FF4500",
                  borderColor: "#FF4500",
                  borderRadius: "6px",
                  fontSize: "12px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#E63900";
                  e.currentTarget.style.borderColor = "#E63900";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FF4500";
                  e.currentTarget.style.borderColor = "#FF4500";
                }}
              >
                {isMobile ? "" : "Detail"}
              </Button>
            </Link>
          </Space>
        );
      },
      align: "center",
      width: isMobile ? "20%" : "15%",
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
              padding: mainPadding,
              paddingBottom: isMobile ? "8px" : "12px",
              borderBottom: "1px solid #F3F4F6",
            }}
          >
            <Title
              level={isMobile ? 5 : 4}
              style={{
                margin: 0,
                marginBottom: isMobile ? "8px" : "12px",
                color: "#1C1C1C",
                fontSize: isMobile ? "16px" : "18px",
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
            <Input.Search
              style={{
                width: isMobile ? "100%" : "400px",
                maxWidth: "100%",
              }}
              placeholder={
                isMobile
                  ? "Cari tiket..."
                  : "Cari tiket berdasarkan judul atau nomor..."
              }
              onChange={handleSearch}
              size={isMobile ? "middle" : "large"}
            />
          </div>

          {/* Table Section */}
          <div style={{ padding: isMobile ? "8px" : "16px" }}>
            <Table
              pagination={{
                total: data?.total,
                position: ["bottomRight"],
                current: query?.page,
                pageSize: 50,
                showTotal: (total, range) =>
                  isMobile
                    ? `${range[0]}-${range[1]} dari ${total}`
                    : `${range[0]}-${range[1]} dari ${total} pertanyaan`,
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
              }}
              columns={columns}
              rowKey={(row) => row?.id}
              loading={isLoading}
              dataSource={data?.results}
              size={isMobile ? "small" : "middle"}
              scroll={{ x: isMobile ? 800 : false }}
            />
          </div>
        </div>
      </Flex>
    </>
  );
};

export default CustomersTickets;

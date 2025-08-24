import { UserOutlined } from "@ant-design/icons";
import { Avatar, Card, Flex, Typography } from "antd";
import React from "react";

const { Text } = Typography;

function DetailUser({ user, status }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "PNS":
        return "#1890FF";
      case "PPPK":
        return "#EB2F96";
      case "NON ASN":
        return "#FA8C16";
      default:
        return "#8C8C8C";
    }
  };

  const statusColor = getStatusColor(status);

  return (
    <Card
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #EDEFF1", 
        borderRadius: "4px",
        marginBottom: "8px",
        transition: "border-color 0.2s ease",
      }}
      bodyStyle={{ padding: "12px" }}
      hoverable
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#898989";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#EDEFF1";
      }}
    >
      <Flex gap={12}>
        {/* Avatar */}
        <Avatar
          size={48}
          src={user?.image}
          alt={user?.username}
          icon={<UserOutlined />}
          style={{
            flexShrink: 0,
          }}
        />

        {/* User Information */}
        <Flex vertical style={{ flex: 1, minWidth: 0 }}>
          {/* Name */}
          <Text
            strong
            style={{
              fontSize: "14px",
              color: "#1A1A1B",
              lineHeight: "18px",
              marginBottom: "2px",
            }}
          >
            {user?.username || "Nama Pengguna"}
          </Text>

          {/* Position */}
          {user?.information?.jabatan?.jabatan && (
            <Text
              style={{
                fontSize: "13px",
                color: "#374151",
                lineHeight: "16px",
                marginBottom: "2px",
              }}
            >
              {user?.information?.jabatan?.jabatan}
            </Text>
          )}

          {/* Employment Status */}
          <Flex align="center" gap={6} style={{ marginBottom: "2px" }}>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: statusColor,
                flexShrink: 0,
              }}
            />
            <Text
              style={{
                fontSize: "12px",
                color: "#6B7280",
                fontWeight: 500,
              }}
            >
              {status || "GUEST"}
            </Text>
          </Flex>

          {/* Organization Unit */}
          {user?.information?.perangkat_daerah?.detail && (
            <Text
              style={{
                fontSize: "12px",
                color: "#9CA3AF",
                lineHeight: "15px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.information?.perangkat_daerah?.detail}
            </Text>
          )}
        </Flex>
      </Flex>
    </Card>
  );
}

export default DetailUser;

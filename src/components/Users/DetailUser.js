import { MessageOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Flex, Typography, Space } from "antd";
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
    <div style={{ minWidth: "240px" }}>
      {/* User Header */}
      <Flex align="center" gap={12} style={{ marginBottom: "16px" }}>
        <div style={{ position: "relative" }}>
          <Avatar
            size={48}
            src={user?.image}
            alt={user?.username}
            icon={<UserOutlined />}
            style={{
              border: `2px solid ${statusColor}`,
              boxShadow: `0 2px 8px ${statusColor}20`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: statusColor,
              border: "2px solid #FFFFFF",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
            }}
          />
        </div>

        <Flex vertical gap={2} style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#1A1A1B",
              margin: 0,
              lineHeight: "20px",
            }}
          >
            {user?.username || "Nama Pengguna"}
          </Text>

          <Flex align="center" gap={4}>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: statusColor,
              }}
            />
            <Text
              style={{
                fontSize: "12px",
                color: "#787C7E",
                margin: 0,
                fontWeight: 500,
              }}
            >
              {status || "GUEST"}
            </Text>
          </Flex>
        </Flex>
      </Flex>

      {/* Job Information */}
      {user?.information?.jabatan?.jabatan && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#F8F9FA",
            borderRadius: "6px",
            border: "1px solid #EDEFF1",
            marginBottom: "12px",
          }}
        >
          <Text
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#1A1A1B",
              display: "block",
              marginBottom: "4px",
            }}
          >
            {user?.information?.jabatan?.jabatan}
          </Text>

          {user?.information?.perangkat_daerah?.detail && (
            <Text
              style={{
                fontSize: "12px",
                color: "#787C7E",
                lineHeight: "16px",
                display: "block",
              }}
            >
              {user?.information?.perangkat_daerah?.detail}
            </Text>
          )}
        </div>
      )}

      {/* Action Button */}
      <Button
        icon={<MessageOutlined />}
        type="primary"
        block
        style={{
          backgroundColor: "#FF4500",
          borderColor: "#FF4500",
          borderRadius: "6px",
          fontWeight: 600,
          height: "36px",
          boxShadow: "0 2px 4px rgba(255, 69, 0, 0.2)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#E63E00";
          e.currentTarget.style.borderColor = "#E63E00";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(255, 69, 0, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#FF4500";
          e.currentTarget.style.borderColor = "#FF4500";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(255, 69, 0, 0.2)";
        }}
      >
        Kirim Pesan
      </Button>

      {/* Additional Info */}
      <div
        style={{
          marginTop: "12px",
          padding: "8px",
          backgroundColor: "rgba(255, 69, 0, 0.05)",
          borderRadius: "4px",
          border: "1px solid rgba(255, 69, 0, 0.1)",
        }}
      >
        <Text
          style={{
            fontSize: "11px",
            color: "#787C7E",
            textAlign: "center",
            display: "block",
            fontStyle: "italic",
          }}
        >
          Klik untuk melihat profil lengkap
        </Text>
      </div>
    </div>
  );
}

export default DetailUser;

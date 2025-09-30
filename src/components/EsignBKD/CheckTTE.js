import React from "react";
import { Spin, Flex } from "antd";
import { Text, Badge } from "@mantine/core";
import {
  IconShieldCheck,
  IconShieldX,
  IconClock,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useCheckTTEUser } from "@/hooks/esign-bkd/useUsers";

const CheckTTE = () => {
  const { data, isLoading } = useCheckTTEUser();

  if (isLoading) {
    return (
      <Flex align="center" gap={8}>
        <Spin size="small" />
        <Text size="xs" c="dimmed">
          Memeriksa status...
        </Text>
      </Flex>
    );
  }

  if (!data?.data) {
    return (
      <div
        style={{
          padding: "8px 12px",
          background: "#f5f5f5",
          borderRadius: 6,
          borderLeft: "3px solid #d9d9d9",
        }}
      >
        <Flex align="center" gap={8}>
          <IconAlertCircle size={16} style={{ color: "#8c8c8c" }} />
          <div>
            <Text size="xs" fw={600} c="dimmed">
              Status Tidak Tersedia
            </Text>
            <Text size="xs" c="dimmed">
              Tidak dapat memuat status sertifikat TTE
            </Text>
          </div>
        </Flex>
      </div>
    );
  }

  const certificateData = data.data;

  // Status configuration
  const statusConfig = {
    ISSUE: {
      color: "green",
      icon: <IconShieldCheck size={16} />,
      text: "Sertifikat Aktif",
      badge: "AKTIF",
      bg: "#f6ffed",
      border: "#b7eb8f",
    },
    EXPIRED: {
      color: "red",
      icon: <IconShieldX size={16} />,
      text: "Sertifikat Kadaluarsa",
      badge: "KADALUARSA",
      bg: "#fff1f0",
      border: "#ffccc7",
    },
    PENDING: {
      color: "yellow",
      icon: <IconClock size={16} />,
      text: "Menunggu Penerbitan",
      badge: "PENDING",
      bg: "#fffbf0",
      border: "#ffe58f",
    },
    REVOKED: {
      color: "red",
      icon: <IconShieldX size={16} />,
      text: "Sertifikat Dicabut",
      badge: "DICABUT",
      bg: "#fff1f0",
      border: "#ffccc7",
    },
  };

  const config = statusConfig[certificateData.status] || {
    color: "gray",
    icon: <IconAlertCircle size={16} />,
    text: "Status Tidak Diketahui",
    badge: certificateData.status || "UNKNOWN",
    bg: "#f5f5f5",
    border: "#d9d9d9",
  };

  return (
    <div
      style={{
        padding: "8px 12px",
        background: config.bg,
        borderRadius: 6,
        borderLeft: `3px solid ${config.border}`,
      }}
    >
      <Flex align="center" gap={8} justify="space-between">
        <Flex align="center" gap={8}>
          <div style={{ color: config.border }}>{config.icon}</div>
          <div>
            <Text size="xs" fw={600}>
              {config.text}
            </Text>
            <Text size="xs" c="dimmed">
              {certificateData.message}
            </Text>
          </div>
        </Flex>
        <Badge color={config.color} variant="light" size="sm">
          {config.badge}
        </Badge>
      </Flex>
    </div>
  );
};

export default CheckTTE;

import React from "react";
import { Flex, Typography, Button, Badge, Tooltip, Breadcrumb } from "antd";
import Link from "next/link";
import {
  CheckOutlined,
  BellOutlined,
  ReloadOutlined,
  BulbOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const UserNotificationHeader = ({
  unreadCount = 0,
  totalCount = 0,
  onMarkAllAsRead,
  onRefresh,
  loading = false,
  refreshing = false,
}) => {
  const hasUnread = unreadCount > 0;

  const getUnreadText = () => {
    if (unreadCount === 0) return "Semua sudah dibaca";
    if (unreadCount === 1) return "1 belum dibaca";
    return `${unreadCount} belum dibaca`;
  };

  return (
    <div
      style={{
        padding: "20px 24px 16px",
        borderBottom: "1px solid #EDEFF1",
        backgroundColor: "white",
      }}
    >
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: "16px" }}
        items={[
          {
            title: <Link href="/asn-connect/asn-knowledge">ASNPedia</Link>,
          },
          {
            title: (
              <Link href="/asn-connect/asn-knowledge/my-knowledge">
                ASNPedia Saya
              </Link>
            ),
          },
          {
            title: <span style={{ color: "#FF4500" }}>Notifikasi</span>,
          },
        ]}
      />

      <Flex justify="space-between" align="flex-start">
        {/* Left: Title and Stats */}
        <Flex vertical gap="4px">
          <Flex align="center" gap="12px">
            <Title
              level={4}
              style={{
                margin: 0,
                color: "#262626",
                fontSize: "20px",
                fontWeight: 600,
              }}
            >
              Notifikasi
            </Title>

            {/* Notification Bell with Badge */}
            <Badge count={unreadCount} size="small" offset={[0, 0]}>
              <BellOutlined
                style={{
                  fontSize: "18px",
                  color: hasUnread ? "#FF4500" : "#8c8c8c",
                }}
              />
            </Badge>
          </Flex>

          {/* Stats */}
          <Flex align="center" gap="16px">
            <Text style={{ color: "#8c8c8c", fontSize: "13px" }}>
              {totalCount > 0
                ? `Total ${totalCount} notifikasi`
                : "Tidak ada notifikasi"}
            </Text>

            {totalCount > 0 && (
              <>
                <span style={{ color: "#d9d9d9" }}>•</span>
                <Text
                  style={{
                    color: hasUnread ? "#FF4500" : "#52c41a",
                    fontSize: "13px",
                    fontWeight: hasUnread ? 600 : 400,
                  }}
                >
                  {getUnreadText()}
                </Text>
              </>
            )}
          </Flex>
        </Flex>

        {/* Right: Actions */}
        <Flex gap="8px" align="center">
          {/* Refresh Button */}
          <Tooltip title="Muat ulang">
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined spin={refreshing} />}
              onClick={onRefresh}
              disabled={refreshing}
              style={{
                color: "#8c8c8c",
                padding: "4px 8px",
                height: "32px",
              }}
            />
          </Tooltip>

          {/* Mark All Read Button */}
          {hasUnread && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={onMarkAllAsRead}
              loading={loading}
              style={{
                backgroundColor: "#FF4500",
                borderColor: "#FF4500",
                height: "32px",
                fontSize: "12px",
                fontWeight: 600,
                padding: "0 16px",
              }}
            >
              Tandai Semua Dibaca
            </Button>
          )}

          {/* All Read State */}
          {!hasUnread && totalCount > 0 && (
            <Flex align="center" gap="6px">
              <CheckOutlined style={{ color: "#52c41a", fontSize: "14px" }} />
              <Text
                style={{ color: "#52c41a", fontSize: "12px", fontWeight: 500 }}
              >
                Semua Sudah Dibaca
              </Text>
            </Flex>
          )}
        </Flex>
      </Flex>

      {/* Additional Info or Quick Stats */}
      {totalCount > 0 && (
        <div
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            backgroundColor: hasUnread ? "#FFF7ED" : "#f6ffed",
            border: `1px solid ${hasUnread ? "#FFE4CC" : "#d9f7be"}`,
            borderRadius: "6px",
          }}
        >
          <Flex align="center" gap="6px">
            {hasUnread ? (
              <BulbOutlined style={{ color: "#d46b08", fontSize: "12px" }} />
            ) : (
              <CheckOutlined style={{ color: "#389e0d", fontSize: "12px" }} />
            )}
            <Text
              style={{
                color: hasUnread ? "#d46b08" : "#389e0d",
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              {hasUnread
                ? `Anda memiliki ${unreadCount} notifikasi yang perlu perhatian`
                : "Semua notifikasi sudah dibaca. Tetap pantau untuk update terbaru!"}
            </Text>
          </Flex>
        </div>
      )}
    </div>
  );
};

export default UserNotificationHeader;

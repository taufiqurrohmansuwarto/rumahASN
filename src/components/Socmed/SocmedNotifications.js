import {
  asnConnectClearNotifications,
  asnConnectGetNotifications,
} from "@/services/socmed.services";
import { serializeCommentText } from "@/utils/client-utils";
import {
  CheckOutlined,
  CheckSquareOutlined,
  CommentOutlined,
  LikeOutlined,
  UserOutlined,
  DeleteOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  List,
  Space,
  Tooltip,
  Badge,
  Avatar,
  Typography,
  Tag,
  message,
  Row,
  Col,
  Flex,
  Grid,
} from "antd";
import React, { useState } from "react";
import AvatarUser from "../Users/AvatarUser";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { readNotifactionsAsnConnect } from "@/services/notifications.services";

dayjs.extend(relativeTime);

const { Text, Link, Title } = Typography;
const { useBreakpoint } = Grid;

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getNotificationContent = (item, currentUserId) => {
  const username = item?.user?.username?.split(" ")[0]; // Ambil nama depan saja
  const userPost = item?.data?.user?.username?.split(" ")[0]; // Ambil nama depan saja

  let whoAmI = currentUserId === item?.target_user_id ? "Anda" : userPost;

  switch (item?.type) {
    case "like_asn_update":
      return `${username} menyukai postingan ${whoAmI}`;
    case "comment_asn_update":
      return `${username} mengomentari postingan ${whoAmI}`;
    case "comment_asn_discussion":
      return `${username} mengomentari diskusi dengan judul ${item?.data?.title}`;
    default:
      return `${username} berinteraksi dengan Anda`;
  }
};

const NotificationIcon = ({ type }) => {
  switch (type) {
    case "like_asn_update":
      return <LikeOutlined style={{ color: "#FF4500" }} />;
    case "comment_asn_update":
      return <CommentOutlined style={{ color: "#FF4500" }} />;
    default:
      return <UserOutlined style={{ color: "#FF4500" }} />;
  }
};

function SocmedNotifications() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { data: userData } = useSession();
  const [query, setQuery] = useState({ page: 1 });

  const { data, isLoading } = useQuery(
    ["asn-connect-notifications", query],
    () => asnConnectGetNotifications(query),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  const { mutate: clearChat, isLoading: loadingClearChat } = useMutation(
    (data) => asnConnectClearNotifications(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["asn-connect-notifications"]);
        message.success("Berhasil menandai semua notifikasi dibaca");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["asn-connect-notifications"]);
      },
    }
  );

  const { mutateAsync: markAsRead, isLoading: loadingMarkAsRead } = useMutation(
    (id) => readNotifactionsAsnConnect(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["asn-connect-notifications"]);
      },
    }
  );

  const gotoDetail = async (item) => {
    const id = item?.reference_id;
    const isAsnUpdate =
      item?.type === "comment_asn_update" || item?.type === "like_asn_update";
    const isAsnDiscussion = item?.type === "comment_asn_discussion";

    await markAsRead(item?.id);

    if (isAsnDiscussion) {
      router.push(`/asn-connect/asn-discussions/${id}/detail`);
    } else if (isAsnUpdate) {
      router.push(`/asn-connect/asn-updates/all/${id}`);
    }
  };

  // Stats untuk notifikasi
  const unreadCount =
    data?.results?.filter((item) => !item?.is_read).length || 0;
  const readCount = (data?.results?.length || 0) - unreadCount;

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
              👥 ASN Connect Notifikasi
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "12px" : "14px" }}
            >
              Notifikasi interaksi di ASN Connect
            </Text>
          </div>
          <Flex align="center" gap={8}>
            {data?.total > 0 && (
              <Tag
                color="orange"
                style={{
                  borderRadius: "12px",
                  fontSize: isMobile ? "10px" : "12px",
                  padding: "4px 12px",
                  fontWeight: 500,
                }}
              >
                {data.total} Total
              </Tag>
            )}
            {data?.total > 0 && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => clearChat()}
                loading={loadingClearChat}
                style={{
                  fontSize: isMobile ? "11px" : "12px",
                  padding: isMobile ? "4px 8px" : "6px 12px",
                  height: "auto",
                }}
              >
                {!isMobile && "Tandai Semua Dibaca"}
              </Button>
            )}
          </Flex>
        </Flex>
      </Card>

      {/* Stats Card */}
      {data && data?.results?.length > 0 && (
        <Card
          style={{
            marginBottom: isMobile ? "12px" : "20px",
            borderRadius: isMobile ? "8px" : "12px",
            border: "1px solid #e8e8e8",
          }}
        >
          <Row gutter={[16, 16]} justify="space-around" align="middle">
            <Col xs={8} sm={8} md={8}>
              <Flex vertical align="center">
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
                  style={{
                    fontSize: isMobile ? "10px" : "12px",
                    textAlign: "center",
                  }}
                >
                  Total
                </Text>
              </Flex>
            </Col>
            <Col xs={8} sm={8} md={8}>
              <Flex vertical align="center">
                <Text
                  style={{
                    fontSize: isMobile ? "18px" : "24px",
                    fontWeight: 600,
                    color: "#ff4d4f",
                  }}
                >
                  {unreadCount}
                </Text>
                <Text
                  type="secondary"
                  style={{
                    fontSize: isMobile ? "10px" : "12px",
                    textAlign: "center",
                  }}
                >
                  Belum Dibaca
                </Text>
              </Flex>
            </Col>
            <Col xs={8} sm={8} md={8}>
              <Flex vertical align="center">
                <Text
                  style={{
                    fontSize: isMobile ? "18px" : "24px",
                    fontWeight: 600,
                    color: "#52c41a",
                  }}
                >
                  {readCount}
                </Text>
                <Text
                  type="secondary"
                  style={{
                    fontSize: isMobile ? "10px" : "12px",
                    textAlign: "center",
                  }}
                >
                  Sudah Dibaca
                </Text>
              </Flex>
            </Col>
          </Row>
        </Card>
      )}

      {/* Main Content */}
      <Card
        style={{
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        {data?.results?.length === 0 && !isLoading ? (
          <Flex
            vertical
            align="center"
            justify="center"
            style={{
              padding: "60px 20px",
              color: "#999",
            }}
          >
            <UserOutlined
              style={{
                fontSize: "64px",
                marginBottom: "16px",
                color: "#d9d9d9",
              }}
            />
            <Title level={4} style={{ color: "#999", margin: "0 0 8px 0" }}>
              Tidak ada notifikasi
            </Title>
            <Text type="secondary">
              Belum ada notifikasi ASN Connect yang tersedia
            </Text>
          </Flex>
        ) : (
          <List
            pagination={{
              showTotal: (total, range) => (
                <Text
                  style={{
                    color: "#666",
                    fontSize: isMobile ? "11px" : "14px",
                  }}
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
                      notifikasi
                    </>
                  )}
                </Text>
              ),
              total: data?.total,
              onChange: (page, pageSize) => {
                setQuery({ ...query, page, pageSize });
              },
              pageSize: data?.per_page,
              current: data?.page,
              simple: isMobile,
              showSizeChanger: !isMobile,
            }}
            itemLayout="horizontal"
            dataSource={data?.results}
            loading={isLoading}
            size={isMobile ? "small" : "default"}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: isMobile ? "12px 16px" : "16px 24px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  borderBottom: "1px solid #f0f0f0",
                  backgroundColor: !item?.is_read ? "#fff7e6" : "#ffffff",
                }}
                onClick={() => gotoDetail(item)}
                actions={[
                  !item?.is_read && (
                    <Badge
                      key="is_read"
                      dot
                      style={{
                        backgroundColor: "#FF4500",
                      }}
                    />
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <AvatarUser
                      src={item?.user?.image}
                      userId={item.user_id}
                      size={isMobile ? 40 : 48}
                    />
                  }
                  title={
                    <Flex vertical gap={4}>
                      <Link
                        onClick={() => gotoDetail(item)}
                        style={{
                          fontSize: isMobile ? "14px" : "16px",
                          fontWeight: !item?.is_read ? 600 : 400,
                          color: !item?.is_read ? "#FF4500" : "#1a1a1a",
                          lineHeight: 1.4,
                        }}
                      >
                        {getNotificationContent(
                          item,
                          userData?.user?.custom_id
                        )}
                      </Link>
                      <Tooltip title={formatTime(item.created_at)}>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: isMobile ? "11px" : "12px",
                            color: "#999",
                          }}
                        >
                          📅 {dayjs(item.created_at).fromNow()}
                        </Text>
                      </Tooltip>
                    </Flex>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <style jsx global>{`
        .ant-list-item:hover {
          background-color: #fff7e6 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 8px rgba(255, 69, 0, 0.15) !important;
          transition: all 0.3s ease !important;
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

        .ant-card {
          transition: all 0.3s ease !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
        }

        .ant-list-item {
          border-radius: 8px !important;
          margin-bottom: 4px !important;
        }

        @media (max-width: 768px) {
          .ant-list-pagination {
            text-align: center !important;
            margin-top: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default SocmedNotifications;

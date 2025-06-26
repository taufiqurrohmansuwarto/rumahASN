import {
  listNotifications,
  removeNotification,
  clearChatsNotificatoins,
} from "@/services/index";
import { formatDateFromNow } from "@/utils/client-utils";
import { formatDate } from "@/utils/index";
import { BellOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  FloatButton,
  Grid,
  List,
  Row,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

// Custom hook untuk notification logic
const useNotifications = (query) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["notifications", query],
    queryFn: () =>
      listNotifications({
        ...query,
        symbol: "no",
      }),
    keepPreviousData: true,
    enabled: !!query,
    retry: 2,
  });

  const { mutateAsync: removeNotificationMutation, isLoading: isRemoving } =
    useMutation({
      mutationFn: (notificationId) => removeNotification(notificationId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        message.success("Notifikasi berhasil ditandai sebagai dibaca");
      },
      onError: (error) => {
        message.error("Gagal menandai notifikasi sebagai dibaca");
        console.error("Remove notification error:", error);
      },
    });

  const { mutate: clearAllNotifications, isLoading: isClearing } = useMutation({
    mutationFn: () => clearChatsNotificatoins(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-total"] });
      message.success("Berhasil menghapus semua notifikasi");
    },
    onError: (error) => {
      message.error("Gagal menghapus notifikasi");
      console.error("Clear notifications error:", error);
    },
  });

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    removeNotificationMutation,
    isRemoving,
    clearAllNotifications,
    isClearing,
  };
};

// Custom hook untuk routing logic
const useNotificationRouting = () => {
  const router = useRouter();

  const handleRouting = useCallback(
    async (item, userRole, removeNotification) => {
      try {
        const { ticket_id } = item;

        // Mark as read if unread
        if (item?.read_at === null) {
          await removeNotification(item?.id);
        }

        // Handle routing based on ticket status and user role
        if (item?.ticket === null) {
          message.warning("Tiket terkait tidak ditemukan");
          return;
        }

        if (item?.ticket?.is_published) {
          router.push(`/customers-tickets/${ticket_id}`);
        } else {
          const roleRoutes = {
            admin: `/customers-tickets/${ticket_id}`,
            user: `/tickets/${ticket_id}/detail`,
            agent: `/agent/tickets/${ticket_id}/detail`,
          };

          const targetRoute = roleRoutes[userRole];
          if (targetRoute) {
            router.push(targetRoute);
          } else {
            message.error("Role tidak dikenali");
          }
        }
      } catch (error) {
        message.error("Gagal membuka notifikasi");
        console.error("Routing error:", error);
      }
    },
    [router]
  );

  return { handleRouting };
};

// Komponen untuk item notifikasi
const NotificationItem = ({ item, onView, isLoading }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <List.Item
      style={{
        opacity: isLoading ? 0.6 : 1,
        padding: isMobile ? "12px 16px" : "16px 24px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        borderBottom: "1px solid #f0f0f0",
        backgroundColor: item?.read_at === null ? "#fff7e6" : "#ffffff",
      }}
      onClick={() => onView(item)}
      actions={[
        <Tooltip key="lihat" title="Lihat Detail">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onView(item);
            }}
            style={{
              color: "#FF4500",
              border: "none",
              padding: "4px 8px",
            }}
          />
        </Tooltip>,
        <div key="status">
          {item?.read_at === null && (
            <Tag
              color="red"
              style={{
                fontSize: isMobile ? "10px" : "11px",
                padding: isMobile ? "2px 6px" : "4px 8px",
                borderRadius: "12px",
                fontWeight: 500,
                backgroundColor: "#fff2f0",
                borderColor: "#ffccc7",
              }}
            >
              🔔 Baru
            </Tag>
          )}
        </div>,
      ]}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            src={item?.from_user?.image}
            size={isMobile ? 40 : 48}
            style={{ backgroundColor: "#FF4500" }}
            icon={<BellOutlined />}
          />
        }
        title={
          <Flex vertical gap={4}>
            <Text
              strong={item?.read_at === null}
              style={{
                fontSize: isMobile ? "14px" : "16px",
                color: item?.read_at === null ? "#FF4500" : "#1a1a1a",
                lineHeight: 1.4,
              }}
            >
              {item?.from_user?.username} {item?.content}
            </Text>
            <Text
              type="secondary"
              style={{
                fontSize: isMobile ? "11px" : "12px",
                color: "#999",
              }}
            >
              <Tooltip title={formatDate(item?.created_at)}>
                📅 {formatDateFromNow(item?.created_at)}
              </Tooltip>
            </Text>
          </Flex>
        }
      />
    </List.Item>
  );
};

function ListNotifications() {
  const { data: userData, status } = useSession();
  const router = useRouter();
  const query = router?.query;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    removeNotificationMutation,
    isRemoving,
    clearAllNotifications,
    isClearing,
  } = useNotifications(query);

  const { handleRouting } = useNotificationRouting();

  const handlePageChange = useCallback(
    (page) => {
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          page,
        },
      });
    },
    [router]
  );

  const handleNotificationView = useCallback(
    async (item) => {
      await handleRouting(
        item,
        userData?.user?.current_role,
        removeNotificationMutation
      );
    },
    [handleRouting, userData?.user?.current_role, removeNotificationMutation]
  );

  const handleClearAllNotifications = useCallback(() => {
    clearAllNotifications();
  }, [clearAllNotifications]);

  const paginationConfig = useMemo(
    () => ({
      showSizeChanger: !isMobile,
      size: isMobile ? "small" : "default",
      position: "both",
      onChange: handlePageChange,
      current: parseInt(query?.page) || 1,
      pageSize: parseInt(query?.limit) || 50,
      total: data?.total || 0,
      showTotal: (total, range) => (
        <Text style={{ color: "#666", fontSize: isMobile ? "11px" : "14px" }}>
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
      simple: isMobile,
      responsive: true,
    }),
    [query, data?.total, handlePageChange, isMobile]
  );

  const isLoadingState =
    isLoading || status === "loading" || isFetching || isRemoving || isClearing;

  // Stats untuk notifikasi
  const unreadCount =
    data?.results?.filter((item) => item?.read_at === null).length || 0;
  const readCount = (data?.results?.length || 0) - unreadCount;

  if (error) {
    return (
      <Card
        style={{
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Alert
          message="Gagal memuat notifikasi"
          description="Terjadi kesalahan saat memuat data notifikasi. Silakan coba lagi."
          type="error"
          action={
            <Button
              onClick={() => refetch()}
              style={{ borderColor: "#FF4500", color: "#FF4500" }}
            >
              Coba Lagi
            </Button>
          }
          showIcon
        />
      </Card>
    );
  }

  return (
    <div>
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
            <BellOutlined
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
              🔔 Notifikasi
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "12px" : "14px" }}
            >
              Daftar notifikasi dan pemberitahuan sistem
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
                onClick={handleClearAllNotifications}
                loading={isClearing}
                style={{
                  fontSize: isMobile ? "11px" : "12px",
                  padding: isMobile ? "4px 8px" : "6px 12px",
                  height: "auto",
                }}
              >
                {!isMobile && "Hapus Semua"}
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
        <FloatButton.BackTop visibilityHeight={100} />

        {data?.results?.length === 0 && !isLoadingState ? (
          <Flex
            vertical
            align="center"
            justify="center"
            style={{
              padding: "60px 20px",
              color: "#999",
            }}
          >
            <BellOutlined
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
              Belum ada notifikasi yang tersedia saat ini
            </Text>
          </Flex>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={data?.results || []}
            loading={isLoadingState}
            pagination={paginationConfig}
            renderItem={(item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onView={handleNotificationView}
                isLoading={isRemoving}
              />
            )}
            style={{
              backgroundColor: "transparent",
            }}
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

        .ant-avatar {
          border: 2px solid #fff !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
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

export default ListNotifications;

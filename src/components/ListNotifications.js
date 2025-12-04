import {
  listNotifications,
  removeNotification,
  clearChatsNotificatoins,
} from "@/services/index";
import { formatDateFromNow } from "@/utils/client-utils";
import {
  IconBell,
  IconCheck,
  IconClock,
  IconInbox,
  IconMessage,
  IconQuestionMark,
  IconStar,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, List, message } from "antd";
import {
  Avatar,
  Badge,
  Box,
  Center,
  Flex,
  Group,
  Indicator,
  Stack,
  Text,
} from "@mantine/core";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";

// Hooks
const useNotifications = (query) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["notifications", query],
    queryFn: () => listNotifications({ ...query, symbol: "no" }),
    enabled: !!query,
    staleTime: 30000,
    cacheTime: 300000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const { mutateAsync: markAsRead, isLoading: isRemoving } = useMutation({
    mutationFn: removeNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      message.success("Berhasil ditandai");
    },
    onError: () => message.error("Terjadi kesalahan"),
  });

  const { mutate: clearAll, isLoading: isClearing } = useMutation({
    mutationFn: clearChatsNotificatoins,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      message.success("Berhasil dibersihkan");
    },
    onError: () => message.error("Terjadi kesalahan"),
  });

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    markAsRead,
    isRemoving,
    clearAll,
    isClearing,
  };
};

const useRouting = () => {
  const router = useRouter();
  const handleRoute = useCallback(
    async (item, role, markAsRead) => {
      if (!item?.read_at) await markAsRead(item?.id);
      if (!item?.ticket) return message.warning("Tiket tidak ditemukan");

      const { ticket_id } = item;
      const path = item?.ticket?.is_published
        ? `/customers-tickets/${ticket_id}`
        : {
            admin: `/customers-tickets/${ticket_id}`,
            user: `/tickets/${ticket_id}/detail`,
            agent: `/agent/tickets/${ticket_id}/detail`,
          }[role];
      path && router.push(path);
    },
    [router]
  );
  return { handleRoute };
};

// Get notification type based on content
const getNotifType = (content) => {
  const text = content?.toLowerCase() || "";
  if (text.includes("rating") || text.includes("bintang")) {
    return { icon: IconStar, color: "#faad14", bg: "#fffbe6", label: "Rating" };
  }
  if (text.includes("pertanyaan") || text.includes("bertanya")) {
    return {
      icon: IconQuestionMark,
      color: "#722ed1",
      bg: "#f9f0ff",
      label: "Pertanyaan",
    };
  }
  return {
    icon: IconMessage,
    color: "#1890ff",
    bg: "#e6f7ff",
    label: "Komentar",
  };
};

// Notification Item
const NotifItem = ({ item, onView }) => {
  const unread = !item?.read_at;
  const notifType = getNotifType(item?.content);
  const TypeIcon = notifType.icon;

  return (
    <Flex
      gap={10}
      p={10}
      onClick={() => onView(item)}
      align="flex-start"
      style={{
        cursor: "pointer",
        borderRadius: 6,
        marginBottom: 4,
        borderLeft: unread
          ? `3px solid ${notifType.color}`
          : "3px solid transparent",
        backgroundColor: unread ? notifType.bg : "transparent",
      }}
      className="notif-item"
    >
      <Box pos="relative">
        <Avatar
          src={item?.from_user?.image}
          size={34}
          radius="xl"
          color="gray"
          style={{
            border: "2px solid #fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          {item?.from_user?.username?.[0]?.toUpperCase()}
        </Avatar>
        <Box
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            backgroundColor: notifType.color,
            borderRadius: "50%",
            width: 16,
            height: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #fff",
          }}
        >
          <TypeIcon size={9} color="#fff" />
        </Box>
      </Box>
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Group gap={6} wrap="nowrap" mb={2}>
          <Text size="xs" fw={unread ? 600 : 400} truncate>
            {item?.from_user?.username}
          </Text>
          <Text size="10px" c="dimmed" ml="auto" style={{ flexShrink: 0 }}>
            <IconClock
              size={10}
              style={{ marginRight: 2, verticalAlign: "middle" }}
            />
            {formatDateFromNow(item?.created_at)}
          </Text>
        </Group>
        <Text size="xs" c={unread ? "dark" : "dimmed"} lineClamp={1}>
          {item?.content}
        </Text>
      </Box>
    </Flex>
  );
};

function ListNotifications() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const query = router?.query;

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    markAsRead,
    isRemoving,
    clearAll,
    isClearing,
  } = useNotifications(query);
  const { handleRoute } = useRouting();

  const onView = useCallback(
    (item) => handleRoute(item, session?.user?.current_role, markAsRead),
    [handleRoute, session?.user?.current_role, markAsRead]
  );

  const onPageChange = useCallback(
    (page, limit) =>
      router.push({
        pathname: router.pathname,
        query: { ...router.query, page, limit },
      }),
    [router]
  );

  const stats = useMemo(() => {
    const r = data?.results || [];
    const unread = r.filter((i) => !i?.read_at).length;
    return { total: data?.total || 0, unread };
  }, [data]);

  const loading =
    isLoading || status === "loading" || isFetching || isRemoving || isClearing;

  if (error) {
    return (
      <Card size="small">
        <Center p="md">
          <Stack align="center" gap={6}>
            <Text size="xs" c="red">
              Gagal memuat data
            </Text>
            <Button size="small" onClick={refetch}>
              Muat Ulang
            </Button>
          </Stack>
        </Center>
      </Card>
    );
  }

  return (
    <Card
      size="small"
      title={
        <Flex justify="space-between" align="center">
          <Group gap={8}>
            <IconBell size={16} color="#1890ff" />
            <Text size="xs" fw={600}>
              Notifikasi
            </Text>
            {stats.unread > 0 && (
              <Badge size="xs" color="blue" variant="light" radius="sm">
                {stats.unread} belum dibaca
              </Badge>
            )}
          </Group>
          {stats.total > 0 && (
            <Button
              type="default"
              size="small"
              icon={<IconCheck size={14} />}
              onClick={clearAll}
              loading={isClearing}
            >
              Tandai Dibaca
            </Button>
          )}
        </Flex>
      }
      styles={{
        header: { padding: "12px 16px" },
        body: { padding: "8px 12px" },
      }}
    >
      {data?.results?.length === 0 && !loading ? (
        <Center py="lg">
          <Stack align="center" gap={6}>
            <IconInbox size={28} color="#adb5bd" />
            <Text size="xs" c="dimmed">
              Belum ada notifikasi
            </Text>
          </Stack>
        </Center>
      ) : (
        <List
          dataSource={data?.results || []}
          loading={loading}
          size="small"
          split={false}
          pagination={{
            current: parseInt(query?.page) || 1,
            pageSize: parseInt(query?.limit) || 25,
            total: data?.total || 0,
            size: "small",
            simple: true,
            onChange: onPageChange,
          }}
          renderItem={(item) => (
            <NotifItem key={item.id} item={item} onView={onView} />
          )}
        />
      )}

      <style jsx global>{`
        .notif-item:hover {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </Card>
  );
}

export default ListNotifications;

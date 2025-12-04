import {
  asnConnectClearNotifications,
  asnConnectGetNotifications,
} from "@/services/socmed.services";
import {
  IconCheck,
  IconClock,
  IconHeart,
  IconInbox,
  IconMessage,
  IconUsers,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, List, message, Tooltip } from "antd";
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
import { useState, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { readNotifactionsAsnConnect } from "@/services/notifications.services";

dayjs.extend(relativeTime);

// Get notification type config
const getNotifType = (type) => {
  switch (type) {
    case "like_asn_update":
      return {
        icon: IconHeart,
        color: "#eb2f96",
        bg: "#fff0f6",
        label: "Like",
      };
    case "comment_asn_update":
    case "comment_asn_discussion":
      return {
        icon: IconMessage,
        color: "#1890ff",
        bg: "#e6f7ff",
        label: "Komentar",
      };
    default:
      return {
        icon: IconUsers,
        color: "#722ed1",
        bg: "#f9f0ff",
        label: "Interaksi",
      };
  }
};

// Get notification content
const getNotifContent = (item, currentUserId) => {
  const username = item?.user?.username?.split(" ")[0];
  const userPost = item?.data?.user?.username?.split(" ")[0];
  const whoAmI = currentUserId === item?.target_user_id ? "Anda" : userPost;

  switch (item?.type) {
    case "like_asn_update":
      return `${username} menyukai postingan ${whoAmI}`;
    case "comment_asn_update":
      return `${username} mengomentari postingan ${whoAmI}`;
    case "comment_asn_discussion":
      return `${username} mengomentari diskusi "${item?.data?.title}"`;
    default:
      return `${username} berinteraksi dengan Anda`;
  }
};

// Notification Item
const NotifItem = ({ item, onView, currentUserId }) => {
  const unread = !item?.is_read;
  const notifType = getNotifType(item?.type);
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
          src={item?.user?.image}
          size={34}
          radius="xl"
          color="gray"
          style={{
            border: "2px solid #fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          {item?.user?.username?.[0]?.toUpperCase()}
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
            {item?.user?.username?.split(" ")[0]}
          </Text>
          <Text size="10px" c="dimmed" ml="auto" style={{ flexShrink: 0 }}>
            <IconClock
              size={10}
              style={{ marginRight: 2, verticalAlign: "middle" }}
            />
            {dayjs(item?.created_at).fromNow()}
          </Text>
        </Group>
        <Text size="xs" c={unread ? "dark" : "dimmed"} lineClamp={1}>
          {getNotifContent(item, currentUserId)}
        </Text>
      </Box>
    </Flex>
  );
};

function SocmedNotifications() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: userData } = useSession();
  const [query, setQuery] = useState({ page: 1 });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["asn-connect-notifications", query],
    queryFn: () => asnConnectGetNotifications(query),
    keepPreviousData: true,
    enabled: !!query,
    staleTime: 30000,
    cacheTime: 300000,
    refetchOnWindowFocus: false,
  });

  const { mutate: clearAll, isLoading: isClearing } = useMutation({
    mutationFn: asnConnectClearNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["asn-connect-notifications"],
      });
      message.success("Berhasil ditandai");
    },
    onError: () => message.error("Terjadi kesalahan"),
  });

  const { mutateAsync: markAsRead, isLoading: isMarking } = useMutation({
    mutationFn: readNotifactionsAsnConnect,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["asn-connect-notifications"],
      });
    },
  });

  const gotoDetail = useCallback(
    async (item) => {
      const id = item?.reference_id;
      await markAsRead(item?.id);

      if (item?.type === "comment_asn_discussion") {
        router.push(`/asn-connect/asn-discussions/${id}/detail`);
      } else {
        router.push(`/asn-connect/asn-updates/all/${id}`);
      }
    },
    [markAsRead, router]
  );

  const stats = useMemo(() => {
    const r = data?.results || [];
    const unread = r.filter((i) => !i?.is_read).length;
    return { total: data?.total || 0, unread };
  }, [data]);

  const loading = isLoading || isFetching || isClearing || isMarking;

  return (
    <Card
      size="small"
      title={
        <Flex justify="space-between" align="center">
          <Group gap={8}>
            <IconUsers size={16} color="#1890ff" />
            <Text size="xs" fw={600}>
              ASN Connect
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
            current: data?.page || 1,
            pageSize: data?.per_page || 25,
            total: data?.total || 0,
            size: "small",
            simple: true,
            onChange: (page, pageSize) =>
              setQuery({ ...query, page, pageSize }),
          }}
          renderItem={(item) => (
            <NotifItem
              key={item.id}
              item={item}
              onView={gotoDetail}
              currentUserId={userData?.user?.custom_id}
            />
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

export default SocmedNotifications;

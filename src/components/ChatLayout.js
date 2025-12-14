import {
  useChatStats,
  useMentionCount,
  useMyChannels,
  usePublicChannels,
  useUnreadCounts,
  useOnlineUsers,
  useBookmarkCount,
  useMyWorkspaceMembership,
  useUpdatePresence,
  useHeartbeat,
} from "@/hooks/useRasnChat";
import { layoutToken } from "@/styles/rasn.theme";
import { Center, Avatar as MantineAvatar, Group as MantineGroup, Indicator } from "@mantine/core";
import {
  IconAt,
  IconBookmark,
  IconCircleFilled,
  IconHash,
  IconLock,
  IconLogout,
  IconPhone,
  IconPlus,
  IconUser,
  IconUsers,
  IconPhoto,
  IconPin,
  IconShield,
  IconWorld,
} from "@tabler/icons-react";
import { Badge, Button, Dropdown, Space, Tooltip } from "antd";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import MegaMenuTop from "./MegaMenu/MegaMenuTop";
import NotifikasiPrivateMessage from "./Notification/NotifikasiPrivateMessage";
import NotifikasiForumKepegawaian from "./Notification/NotifikasiForumKepegawaian";
import ChatNotifications, { useChatNotifications } from "./RasnChat/ChatNotifications";

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  { ssr: false }
);

function ChatLayout({ children, onCompose, currentChannelId }) {
  const { data } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const heartbeatIntervalRef = useRef(null);

  const { data: stats } = useChatStats();
  const { data: mentionData } = useMentionCount();
  const { data: bookmarkData } = useBookmarkCount();
  const { data: channels } = useMyChannels();
  const { data: publicChannels } = usePublicChannels();
  const { data: unreadData } = useUnreadCounts();
  const { data: onlineUsers } = useOnlineUsers();
  const { data: membership } = useMyWorkspaceMembership();

  // Filter public channels that user hasn't joined yet
  const browseableChannels = (publicChannels || []).filter((c) => !c.is_member);

  const updatePresence = useUpdatePresence();
  const heartbeat = useHeartbeat();

  // Enable chat notifications
  useChatNotifications(currentChannelId);

  // Check if user can manage roles (superadmin or admin only)
  const permissions = membership?.role?.permissions || {};
  const canManageRoles = permissions.all === true || permissions.manage_roles === true;

  // Auto-update presence when entering chat
  useEffect(() => {
    // Set user as online when entering
    updatePresence.mutate({ status: "online" });

    // Send heartbeat every 30 seconds to keep online status
    heartbeatIntervalRef.current = setInterval(() => {
      heartbeat.mutate();
    }, 30000);

    // Cleanup: set offline when leaving
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, []);

  const getUnreadCount = (channelId) => {
    return unreadData?.channels?.find((c) => c.channelId === channelId)?.count || 0;
  };

  const handleCompose = () => {
    if (onCompose) {
      onCompose();
    } else {
      router.push("/rasn-chat?compose=true");
    }
  };

  // Get status color for online indicator
  const getStatusColor = (status) => {
    const colors = {
      online: "#22C55E",
      away: "#F59E0B",
      busy: "#EF4444",
      offline: "#9CA3AF",
    };
    return colors[status] || colors.offline;
  };

  // Get current channel ID from router
  const currentChannel = router.query?.channelId;

  const getAllRoutes = () => {
    const mainRoutes = [
      {
        key: "/rasn-chat/mentions",
        path: "/rasn-chat/mentions",
        name:
          mentionData?.count > 0 ? (
            <Space>
              Sebutan
              <Badge count={mentionData.count} size="small" />
            </Space>
          ) : (
            "Sebutan"
          ),
        icon: <IconAt size={16} />,
      },
      {
        key: "/rasn-chat/bookmarks",
        path: "/rasn-chat/bookmarks",
        name:
          bookmarkData?.count > 0 ? (
            <Space>
              Tersimpan
              <Badge count={bookmarkData.count} size="small" style={{ backgroundColor: "#faad14" }} />
            </Space>
          ) : (
            "Tersimpan"
          ),
        icon: <IconBookmark size={16} />,
      },
      {
        key: "/rasn-chat/calls",
        path: "/rasn-chat/calls",
        name: "Riwayat Panggilan",
        icon: <IconPhone size={16} />,
      },
    ];

    // Only show Kelola Roles for admin/superadmin
    if (canManageRoles) {
      mainRoutes.push({
        key: "/rasn-chat/roles",
        path: "/rasn-chat/roles",
        name: "Kelola Roles",
        icon: <IconShield size={16} />,
      });
    }

    mainRoutes.push(
      {
        key: "divider-channels",
        type: "divider",
      },
      {
        key: "channels-header",
        path: "#",
        name: `CHANNEL (${channels?.length || 0})`,
        disabled: true,
      }
    );

    // Add channels with submenu for current channel
    const channelRoutes = (channels || []).map((channel) => {
      const unread = getUnreadCount(channel.id);
      const isCurrentChannel = currentChannel === channel.id;

      const channelRoute = {
        key: `/rasn-chat/${channel.id}`,
        path: `/rasn-chat/${channel.id}`,
        name:
          unread > 0 ? (
            <Space>
              {channel.name}
              <Badge count={unread} size="small" />
            </Space>
          ) : (
            channel.name
          ),
        icon:
          channel.type === "private" ? (
            <IconLock size={14} />
          ) : (
            <IconHash size={14} />
          ),
      };

      // Add submenu for current channel
      if (isCurrentChannel) {
        channelRoute.routes = [
          {
            key: `/rasn-chat/${channel.id}/members`,
            path: `/rasn-chat/${channel.id}/members`,
            name: "Anggota",
            icon: <IconUsers size={12} />,
          },
          {
            key: `/rasn-chat/${channel.id}/media`,
            path: `/rasn-chat/${channel.id}/media`,
            name: "Media & File",
            icon: <IconPhoto size={12} />,
          },
          {
            key: `/rasn-chat/${channel.id}/pinned`,
            path: `/rasn-chat/${channel.id}/pinned`,
            name: "Pesan Dipin",
            icon: <IconPin size={12} />,
          },
        ];
      }

      return channelRoute;
    });

    // Browseable public channels (not joined yet)
    const browseRoutes = [];
    if (browseableChannels.length > 0) {
      browseRoutes.push(
        {
          key: "divider-browse",
          type: "divider",
        },
        {
          key: "browse-header",
          path: "#",
          name: `JELAJAHI CHANNEL (${browseableChannels.length})`,
          disabled: true,
        }
      );

      browseableChannels.slice(0, 5).forEach((channel) => {
        browseRoutes.push({
          key: `/rasn-chat/${channel.id}`,
          path: `/rasn-chat/${channel.id}`,
          name: (
            <Tooltip title="Klik untuk bergabung">
              <span style={{ color: "#888" }}>{channel.name}</span>
            </Tooltip>
          ),
          icon: <IconWorld size={14} color="#888" />,
        });
      });
    }

    // Online users - compact inline display
    const onlineCount = onlineUsers?.length || 0;
    const dmRoutes = onlineCount > 0 ? [
      {
        key: "divider-dm",
        type: "divider",
      },
      {
        key: "dm-header",
        path: "#",
        name: (
          <MantineGroup gap={6} wrap="nowrap" style={{ paddingBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#999", whiteSpace: "nowrap" }}>
              ONLINE
            </span>
            <MantineAvatar.Group spacing={4}>
              {(onlineUsers || []).slice(0, 5).map((presence) => (
                <Tooltip
                  key={presence.user_id}
                  title={`${presence.user?.username} - ${getStatusLabel(presence.status)}`}
                >
                  <Indicator
                    color={getStatusColor(presence.status)}
                    size={6}
                    offset={1}
                    position="bottom-end"
                    withBorder
                  >
                    <MantineAvatar
                      src={presence.user?.image}
                      size={24}
                      radius="xl"
                    >
                      {presence.user?.username?.[0]?.toUpperCase()}
                    </MantineAvatar>
                  </Indicator>
                </Tooltip>
              ))}
              {onlineCount > 5 && (
                <MantineAvatar size={24} radius="xl" color="gray">
                  +{onlineCount - 5}
                </MantineAvatar>
              )}
            </MantineAvatar.Group>
          </MantineGroup>
        ),
        disabled: true,
      },
    ] : [];

    return [...mainRoutes, ...channelRoutes, ...browseRoutes, ...dmRoutes];
  };

  // Get status label in Indonesian
  const getStatusLabel = (status) => {
    const labels = {
      online: "Aktif",
      away: "Tidak di Tempat",
      busy: "Sibuk",
      offline: "Offline",
    };
    return labels[status] || "Offline";
  };

  const handleMenuClick = ({ key }) => {
    // Skip non-navigable items
    if (
      key === "channels-header" ||
      key === "divider-channels" ||
      key === "dm-header" ||
      key === "browse-header" ||
      key === "divider-browse" ||
      key === "divider-dm"
    ) {
      return;
    }

    // Helper to find route including nested routes
    const findRoute = (routes, targetKey) => {
      for (const route of routes) {
        if (route.key === targetKey) return route;
        if (route.routes) {
          const found = findRoute(route.routes, targetKey);
          if (found) return found;
        }
      }
      return null;
    };

    const route = findRoute(getAllRoutes(), key);
    if (route?.path && route.path !== "#") {
      router.push(route.path);
    }
  };

  return (
    <ProLayout
      title="RASN Chat"
      defaultCollapsed={collapsed}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      selectedKeys={[router.asPath]}
      logo={null}
      layout="mix"
      token={layoutToken}
      menuExtraRender={({ collapsed, isMobile }) => {
        if (!collapsed) {
          return (
            <Center>
              <Button
                style={{
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: "center",
                }}
                onClick={handleCompose}
                shape="round"
                icon={<IconPlus size={16} />}
                block
                type="primary"
              >
                Channel Baru
              </Button>
            </Center>
          );
        } else {
          return (
            <Center>
              <Button
                onClick={handleCompose}
                shape="circle"
                size="middle"
                icon={<IconPlus size={16} />}
                type="primary"
              />
            </Center>
          );
        }
      }}
      actionsRender={() => [
        <NotifikasiPrivateMessage
          key="private-message"
          url="/mails"
          title="Inbox Pesan Pribadi"
        />,
        <NotifikasiForumKepegawaian
          key="forum-kepegawaian"
          url="forum-kepegawaian"
          title="Inbox Forum Kepegawaian"
        />,
        <MegaMenuTop key="mega-menu" url="" title="Menu" />,
      ]}
      avatarProps={{
        src: data?.user?.image,
        size: "large",
        render: (props, dom) => {
          return (
            <Space>
              <Dropdown
                menu={{
                  onClick: (e) => {
                    if (e.key === "logout") {
                      signOut();
                    }
                    if (e.key === "profile") {
                      router.push("/settings/profile");
                    }
                  },
                  items: [
                    {
                      key: "profile",
                      icon: <IconUser size={16} />,
                      label: "Profil",
                    },
                    {
                      type: "divider",
                    },
                    {
                      key: "logout",
                      icon: <IconLogout size={16} />,
                      label: "Keluar",
                    },
                  ],
                }}
              >
                {dom}
              </Dropdown>
            </Space>
          );
        },
      }}
      route={{
        routes: getAllRoutes(),
      }}
      menuItemRender={(item, dom) => {
        if (item.disabled) {
          return (
            <span style={{ color: "#999", fontSize: 11, fontWeight: 600 }}>
              {item.name}
            </span>
          );
        }
        return <a onClick={() => handleMenuClick({ key: item.key })}>{dom}</a>;
      }}
      footerRender={() => (
        <div style={{ textAlign: "center", padding: "8px 0", color: "#999", fontSize: 11 }}>
          Total {stats?.channels || 0} channel, {stats?.messages || 0} pesan
        </div>
      )}
    >
      {children}
    </ProLayout>
  );
}

export default ChatLayout;


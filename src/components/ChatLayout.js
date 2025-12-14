import {
  useChatStats,
  useMentionCount,
  useMyChannels,
  useUnreadCounts,
  useOnlineUsers,
  useBookmarkCount,
} from "@/hooks/useRasnChat";
import { layoutToken } from "@/styles/rasn.theme";
import { Center } from "@mantine/core";
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
} from "@tabler/icons-react";
import { Badge, Button, Dropdown, Space } from "antd";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
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

  const { data: stats } = useChatStats();
  const { data: mentionData } = useMentionCount();
  const { data: bookmarkData } = useBookmarkCount();
  const { data: channels } = useMyChannels();
  const { data: unreadData } = useUnreadCounts();
  const { data: onlineUsers } = useOnlineUsers();

  // Enable chat notifications
  useChatNotifications(currentChannelId);

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

  const getAllRoutes = () => {
    const mainRoutes = [
      {
        key: "/rasn-chat/mentions",
        path: "/rasn-chat/mentions",
        name:
          mentionData?.count > 0 ? (
            <Space>
              Mentions
              <Badge count={mentionData.count} size="small" />
            </Space>
          ) : (
            "Mentions"
          ),
        icon: <IconAt size={16} />,
      },
      {
        key: "/rasn-chat/bookmarks",
        path: "/rasn-chat/bookmarks",
        name:
          bookmarkData?.count > 0 ? (
            <Space>
              Saved Items
              <Badge count={bookmarkData.count} size="small" style={{ backgroundColor: "#faad14" }} />
            </Space>
          ) : (
            "Saved Items"
          ),
        icon: <IconBookmark size={16} />,
      },
      {
        key: "/rasn-chat/calls",
        path: "/rasn-chat/calls",
        name: "Riwayat Call",
        icon: <IconPhone size={16} />,
      },
      {
        key: "/rasn-chat/roles",
        path: "/rasn-chat/roles",
        name: "Kelola Roles",
        icon: <IconUsers size={16} />,
      },
      {
        key: "divider-channels",
        type: "divider",
      },
      {
        key: "channels-header",
        path: "#",
        name: `CHANNELS (${channels?.length || 0})`,
        disabled: true,
      },
    ];

    // Add channels
    const channelRoutes = (channels || []).map((channel) => {
      const unread = getUnreadCount(channel.id);
      return {
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
    });

    // Direct Messages header and online users
    const dmRoutes = [
      {
        key: "divider-dm",
        type: "divider",
      },
      {
        key: "dm-header",
        path: "#",
        name: `DIRECT MESSAGES${onlineUsers?.length > 0 ? ` (${onlineUsers.length} online)` : ""}`,
        disabled: true,
      },
    ];

    // Add online users as DM options
    const userRoutes = (onlineUsers || []).slice(0, 8).map((presence) => ({
      key: `dm-${presence.user_id}`,
      path: "#",
      name: (
        <Space size={4}>
          <IconCircleFilled size={8} color={getStatusColor(presence.status)} />
          <span>{presence.user?.username || "User"}</span>
        </Space>
      ),
      icon: null,
    }));

    return [...mainRoutes, ...channelRoutes, ...dmRoutes, ...userRoutes];
  };

  const handleMenuClick = ({ key }) => {
    if (key === "channels-header" || key === "divider-channels" || key === "dm-header" || key.startsWith("dm-")) {
      return;
    }

    const route = getAllRoutes().find((r) => r.key === key);
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
          {stats?.messages || 0} pesan total
        </div>
      )}
    >
      {children}
    </ProLayout>
  );
}

export default ChatLayout;


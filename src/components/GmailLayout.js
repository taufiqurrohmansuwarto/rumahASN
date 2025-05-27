import { useEmailStats } from "@/hooks/useEmails";
import {
  BellOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  FileOutlined,
  FolderOutlined,
  InboxOutlined,
  LogoutOutlined,
  MailOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
  SettingOutlined,
  StarOutlined,
  TagOutlined,
  UpOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ProConfigProvider, ProLayout } from "@ant-design/pro-components";
import {
  Badge,
  Button,
  ConfigProvider,
  Dropdown,
  Input,
  Space,
  Typography,
} from "antd";
import frFR from "antd/lib/locale/id_ID";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import MegaMenuTop from "./MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "./Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "./Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "./Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "./Notification/NotifikasiPrivateMessage";

const { Search } = Input;
const { Text } = Typography;

function GmailLayout({
  children,
  active = "inbox",
  onCompose,
  onSearch,
  showSearchBar = true,
}) {
  const { data } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [showMoreItems, setShowMoreItems] = useState(false);

  // Fetch email stats untuk unread counts
  const { data: emailStats } = useEmailStats();

  // Custom labels (nanti bisa dari API)
  const customLabels = [
    { id: "work", name: "Pekerjaan", color: "#1890ff", count: 3 },
    { id: "important", name: "Penting", color: "#ff4d4f", count: 1 },
    { id: "personal", name: "Pribadi", color: "#52c41a", count: 0 },
  ];

  // Handle compose button click
  const handleCompose = () => {
    if (onCompose) {
      onCompose();
    } else {
      router.push("/mails/compose");
    }
  };

  // Handle search
  const handleSearch = (value) => {
    if (onSearch) {
      onSearch(value);
    } else {
      if (value.trim()) {
        router.push(`/mails/search?q=${encodeURIComponent(value)}`);
      }
    }
  };

  // Menu items configuration dengan flat structure
  const getAllRoutes = () => {
    // Main items (selalu visible)
    const mainRoutes = [
      {
        key: "/mails/inbox",
        path: "/mails/inbox",
        name:
          emailStats?.data?.unreadCount > 0 ? (
            <Space>
              Kotak Masuk
              <Badge
                count={emailStats.data.unreadCount}
                size="small"
                style={{ backgroundColor: "#EA4335" }}
              />
            </Space>
          ) : (
            "Kotak Masuk"
          ),
        icon: <InboxOutlined />,
      },
      {
        key: "/mails/starred",
        path: "/mails/starred",
        name: "Ditandai",
        icon: <StarOutlined />,
      },
      {
        key: "/mails/snoozed",
        path: "/mails/snoozed",
        name: "Ditunda",
        icon: <BellOutlined />,
      },
      {
        key: "/mails/sent",
        path: "/mails/sent",
        name: "Terkirim",
        icon: <SendOutlined />,
      },
      {
        key: "/mails/drafts",
        path: "/mails/drafts",
        name:
          emailStats?.data?.draftCount > 0 ? (
            <Space>
              Draft
              <Badge
                count={emailStats.data.draftCount}
                size="small"
                style={{ backgroundColor: "#1890ff" }}
              />
            </Space>
          ) : (
            "Draft"
          ),
        icon: <FileOutlined />,
      },
      {
        key: "/mails/trash",
        path: "/mails/trash",
        name: "Sampah",
        icon: <DeleteOutlined />,
      },
      {
        key: "/mails/archive",
        path: "/mails/archive",
        name: "Arsip",
        icon: <FolderOutlined />,
      },
      {
        key: "/mails/spam",
        path: "/mails/spam",
        name: "Spam",
        icon: <BellOutlined />,
      },
    ];

    // More section items (conditional)
    const moreRoutes = [
      {
        key: "more-divider",
        name: "Lainnya",
        icon: showMoreItems ? <UpOutlined /> : <DownOutlined />,
        path: "#",
      },
      ...(showMoreItems
        ? [
            {
              key: "/mails/important",
              path: "/mails/important",
              name: "Penting",
              icon: <TagOutlined style={{ color: "#ff4d4f" }} />,
            },
            ...customLabels.map((label) => ({
              key: `/mails/label/${label.id}`,
              path: `/mails/label/${label.id}`,
              name:
                label.count > 0 ? (
                  <Space>
                    {label.name}
                    <Badge count={label.count} size="small" />
                  </Space>
                ) : (
                  label.name
                ),
              icon: <TagOutlined style={{ color: label.color }} />,
            })),
            {
              key: "/mails/labels/create",
              path: "/mails/labels/create",
              name: "Buat Label",
              icon: <PlusOutlined />,
            },
          ]
        : []),
    ];

    return [...mainRoutes, ...moreRoutes];
  };

  // Menu item click handler
  const handleMenuClick = ({ key }) => {
    console.log("Menu clicked:", key);

    if (key === "more-divider") {
      setShowMoreItems(!showMoreItems);
      return;
    }

    // Find route and navigate
    const route = getAllRoutes().find((r) => r.key === key);
    if (route?.path && route.path !== "#") {
      router.push(route.path);
    }
  };

  const token = {
    header: {
      colorBgHeader: "#FFFFFF",
      colorHeaderTitle: "#5F6368",
    },
    bgLayout: "#FFFFFF",
    colorPrimary: "#EA4335",
    sider: {
      colorBgCollapsedButton: "#FFFFFF",
      colorTextCollapsedButton: "#5F6368",
      colorTextCollapsedButtonHover: "#202124",
      colorBgMenuItemActive: "#FCE8E6",
      colorTextMenuTitle: "#5F6368",
      colorTextMenuItemHover: "#202124",
      colorTextMenuSelected: "#D93025",
      colorTextMenuActive: "#D93025",
      colorBgMenuItemHover: "#F1F3F4",
      colorBgMenuItemSelected: "#FCE8E6",
      colorBgMenuItemCollapsedElevated: "#FFFFFF",
      colorTextMenu: "#5F6368",
      colorBgMenu: "#FFFFFF",
      colorTextMenuSecondary: "#5F6368",
      colorMenuItemDivider: "#E8EAED",
    },
  };

  return (
    <div style={{ height: "100vh", overflow: "auto" }}>
      <ConfigProvider locale={frFR} theme={{ token }}>
        <ProConfigProvider>
          <ProLayout
            title="Rumah ASN Mail"
            logo={<MailOutlined style={{ color: "#EA4335" }} />}
            // Layout configuration
            layout="mix"
            navTheme="light"
            colorPrimary="#EA4335"
            fixedHeader
            fixSiderbar
            // Collapse configuration
            collapsed={collapsed}
            onCollapse={setCollapsed}
            // Menu configuration dengan flat structure
            route={{
              routes: getAllRoutes(),
            }}
            selectedKeys={[active]}
            onMenuHeaderClick={(e) => console.log("Menu header clicked", e)}
            menuItemRender={(item, dom) => (
              <div onClick={() => handleMenuClick({ key: item.key })}>
                {dom}
              </div>
            )}
            // Menu extra render untuk compose button
            menuExtraRender={({ collapsed, isMobile }) => {
              if (collapsed) {
                return (
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <Button
                      onClick={handleCompose}
                      shape="circle"
                      size="large"
                      icon={<EditOutlined />}
                      type="primary"
                    />
                  </div>
                );
              } else {
                return (
                  <div style={{ padding: "0 16px", marginBottom: 16 }}>
                    <Button
                      onClick={handleCompose}
                      shape="round"
                      icon={<EditOutlined />}
                      block
                      type="primary"
                      size="large"
                      style={{ fontWeight: "500" }}
                    >
                      Tulis Email
                    </Button>
                  </div>
                );
              }
            }}
            // Actions render
            actionsRender={() => [
              <NotifikasiKepegawaian
                key="kepegawaian"
                url="kepegawaian"
                title="Inbox Kepegawaian"
              />,
              <NotifikasiPrivateMessage
                key="private-message"
                url="/mails"
                title="Inbox Pesan Pribadi"
              />,
              <NotifikasiASNConnect
                key="asn-connect"
                url="asn-connect"
                title="Inbox ASN Connect"
              />,
              <NotifikasiForumKepegawaian
                key="forum-kepegawaian"
                url="forum-kepegawaian"
                title="Inbox Forum Kepegawaian"
              />,
              <Button
                key="mail-settings"
                type="text"
                icon={<SettingOutlined />}
                onClick={() => router.push("/mails/settings")}
                title="Pengaturan Mail"
              />,
              <MegaMenuTop key="mega-menu" url="" title="Menu" />,
            ]}
            // Avatar props
            avatarProps={{
              src: data?.user?.image,
              size: "large",
              render: (props, dom) => (
                <Dropdown
                  menu={{
                    onClick: (e) => {
                      if (e.key === "logout") signOut();
                      if (e.key === "profile") router.push("/settings/profile");
                      if (e.key === "mail-settings")
                        router.push("/mails/settings");
                    },
                    items: [
                      {
                        key: "profile",
                        icon: <UserOutlined />,
                        label: "Profil",
                      },
                      {
                        key: "mail-settings",
                        icon: <SettingOutlined />,
                        label: "Pengaturan Mail",
                      },
                      {
                        type: "divider",
                      },
                      {
                        key: "logout",
                        icon: <LogoutOutlined />,
                        label: "Keluar",
                      },
                    ],
                  }}
                >
                  {dom}
                </Dropdown>
              ),
            }}
            // Token untuk styling
            token={token}
          >
            {children}
          </ProLayout>
        </ProConfigProvider>
      </ConfigProvider>
    </div>
  );
}

export default GmailLayout;

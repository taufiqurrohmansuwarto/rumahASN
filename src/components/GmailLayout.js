import { useEmailStats } from "@/hooks/useEmails";
import {
  BellOutlined,
  DeleteOutlined,
  EditOutlined,
  FileOutlined,
  FolderOutlined,
  InboxOutlined,
  LogoutOutlined,
  MailOutlined,
  SearchOutlined,
  SendOutlined,
  SettingOutlined,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ProConfigProvider } from "@ant-design/pro-components";
import { Center } from "@mantine/core";
import {
  Badge,
  Button,
  ConfigProvider,
  Dropdown,
  Input,
  Layout,
  Space,
} from "antd";
import frFR from "antd/lib/locale/id_ID";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import MegaMenuTop from "./MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "./Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "./Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "./Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "./Notification/NotifikasiPrivateMessage";
// Tambahan import untuk email functionality

const { Search } = Input;

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

function GmailLayout({
  children,
  active = "inbox",
  onCompose, // Callback untuk compose
  onSearch, // Callback untuk search
  showSearchBar = true, // Toggle search bar
}) {
  const { data } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);

  // Fetch email stats untuk unread counts
  const { data: emailStats } = useEmailStats();

  // Enhanced menu items dengan unread counts
  const menuItems = [
    {
      key: "inbox",
      icon: <InboxOutlined />,
      label: "Kotak Masuk",
      count: emailStats?.unreadCount || 0,
    },
    {
      key: "sent",
      icon: <SendOutlined />,
      label: "Pesan Terkirim",
    },
    {
      key: "drafts",
      icon: <FileOutlined />,
      label: "Draft",
      count: emailStats?.draftCount || 0,
    },
    {
      key: "starred",
      icon: <StarOutlined />,
      label: "Ditandai",
    },
    {
      key: "archive",
      icon: <FolderOutlined />,
      label: "Arsip",
    },
    {
      key: "trash",
      icon: <DeleteOutlined />,
      label: "Sampah",
    },
  ];

  const token = {
    header: {
      colorBgHeader: "#FFFFFF",
      colorHeaderTitle: "#5F6368",
    },
    bgLayout: "#FFFFFF",
    colorPrimary: "#EA4335", // Gmail red
    sider: {
      colorBgCollapsedButton: "#FFFFFF",
      colorTextCollapsedButton: "#5F6368",
      colorTextCollapsedButtonHover: "#202124",
      colorBgMenuItemActive: "#FCE8E6", // Light red for active item
      colorTextMenuTitle: "#5F6368",
      colorTextMenuItemHover: "#202124",
      colorTextMenuSelected: "#D93025", // Darker red for selected text
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

  // Handle compose button click
  const handleCompose = () => {
    if (onCompose) {
      onCompose();
    } else {
      // Default behavior - navigate to compose page
      router.push("/mails/compose");
    }
  };

  // Handle menu item click
  const handleMenuClick = (item) => {
    console.log("Clicked:", item.name);

    // Navigate based on menu item
    const folderKey = item.path.split("/").pop();
    router.push(`/mails/${folderKey}`);
  };

  // Handle search
  const handleSearch = (value) => {
    if (onSearch) {
      onSearch(value);
    } else {
      // Default behavior - navigate to search page
      if (value.trim()) {
        router.push(`/helpdesk/mails/search?q=${encodeURIComponent(value)}`);
      }
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        overflow: "auto",
      }}
    >
      <ConfigProvider
        locale={frFR}
        theme={{
          token: token,
        }}
      >
        <ProConfigProvider>
          <ProLayout
            title="Mail ASN"
            defaultCollapsed={collapsed}
            collapsed={collapsed}
            onCollapse={setCollapsed}
            selectedKeys={[active]}
            logo={<MailOutlined style={{ color: "#EA4335" }} />}
            layout="mix"
            navTheme="light"
            fixedHeader
            fixSiderbar
            // Enhanced header content dengan search
            headerContentRender={() => {
              if (showSearchBar) {
                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Search
                      placeholder="Cari email..."
                      allowClear
                      onSearch={handleSearch}
                      style={{
                        maxWidth: 400,
                        marginLeft: 24,
                        marginRight: "auto",
                      }}
                      enterButton={<SearchOutlined />}
                    />
                  </div>
                );
              }
              return null;
            }}
            // Enhanced menu extra dengan compose button
            menuExtraRender={({ collapsed, isMobile }) => {
              if (!collapsed) {
                if (isMobile)
                  return (
                    <Button
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: 8,
                        marginTop: 8,
                      }}
                      onClick={handleCompose}
                      size="middle"
                      shape="round"
                      type="primary"
                      icon={<EditOutlined />}
                    >
                      Compose
                    </Button>
                  );
                else {
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
                        icon={<EditOutlined />}
                        block
                        type="primary"
                      >
                        Compose
                      </Button>
                    </Center>
                  );
                }
              } else {
                return (
                  <Center>
                    <Button
                      onClick={handleCompose}
                      shape="circle"
                      size="middle"
                      icon={<EditOutlined />}
                      type="primary"
                    />
                  </Center>
                );
              }
            }}
            // Enhanced actions dengan mail-specific notifications
            actionsRender={(props) => {
              return [
                <NotifikasiKepegawaian
                  key="kepegawaian"
                  url="kepegawaian"
                  title="Inbox Kepegawaian"
                />,
                <NotifikasiPrivateMessage
                  key="private-message"
                  url="/helpdesk/mails"
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

                // Tambahan: Mail Settings
                <Button
                  key="mail-settings"
                  type="text"
                  icon={<SettingOutlined />}
                  onClick={() => router.push("/helpdesk/mails/settings")}
                  title="Mail Settings"
                />,

                <MegaMenuTop key="mega-menu" url="" title="Menu" />,
              ];
            }}
            // Enhanced avatar dengan mail-specific menu
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
                          if (e.key === "mail-settings") {
                            router.push("/helpdesk/mails/settings");
                          }
                          if (e.key === "broadcast") {
                            router.push("/helpdesk/mails/broadcast");
                          }
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
                          // Kondisional untuk admin/moderator
                          ...(data?.user?.current_role === "admin" ||
                          data?.user?.current_role === "moderator"
                            ? [
                                {
                                  key: "broadcast",
                                  icon: <BellOutlined />,
                                  label: "Broadcast Email",
                                },
                              ]
                            : []),
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
                  </Space>
                );
              },
            }}
            token={token}
            // Enhanced route dengan unread counts
            route={{
              routes: menuItems.map((item) => ({
                path: `/helpdesk/mails/${item.key}`,
                name: item.label,
                icon: item.icon,
                // Tambah badge untuk unread count
                ...(item.count > 0 && {
                  name: (
                    <Space>
                      {item.label}
                      <Badge
                        count={item.count}
                        size="small"
                        style={{ backgroundColor: "#EA4335" }}
                      />
                    </Space>
                  ),
                }),
              })),
            }}
            // Enhanced menu item render dengan proper navigation
            menuItemRender={(item, dom) => (
              <a
                onClick={() => handleMenuClick(item)}
                style={{ textDecoration: "none" }}
              >
                {dom}
              </a>
            )}
          >
            <Layout>{children}</Layout>
          </ProLayout>
        </ProConfigProvider>
      </ConfigProvider>
    </div>
  );
}

export default GmailLayout;

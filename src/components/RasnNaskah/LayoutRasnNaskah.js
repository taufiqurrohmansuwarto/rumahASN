import { layoutToken } from "@/styles/rasn.theme";
import { Center } from "@mantine/core";
import {
  IconBook,
  IconBookmark,
  IconChartBar,
  IconChevronDown,
  IconChevronUp,
  IconFileText,
  IconFilePlus,
  IconHistory,
  IconLogout,
  IconSettings,
  IconTemplate,
  IconUpload,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import {
  Badge,
  Button,
  Dropdown,
  Space,
} from "antd";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import MegaMenuTop from "../MegaMenu/MegaMenuTop";
import NotifikasiForumKepegawaian from "../Notification/NotifikasiForumKepegawaian";
import NotifikasiPrivateMessage from "../Notification/NotifikasiPrivateMessage";

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  { ssr: false }
);

function LayoutRasnNaskah({ children, active = "upload", isAdmin = false }) {
  const { data } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(true);
  const [showAdminItems, setShowAdminItems] = useState(false);

  // Handle upload button click
  const handleUpload = () => {
    router.push("/rasn-naskah/upload");
  };

  // Menu items configuration dengan flat structure
  const getAllRoutes = () => {
    const mainRoutes = [
      {
        key: "/rasn-naskah",
        path: "/rasn-naskah",
        name: "Dokumen Saya",
        icon: <IconFileText size={16} />,
      },
      {
        key: "/rasn-naskah/create",
        path: "/rasn-naskah/create",
        name: "Buat Baru",
        icon: <IconFilePlus size={16} />,
      },
      {
        key: "/rasn-naskah/bookmarks",
        path: "/rasn-naskah/bookmarks",
        name: "Ditandai",
        icon: <IconBookmark size={16} />,
      },
      {
        key: "/rasn-naskah/history",
        path: "/rasn-naskah/history",
        name: "Riwayat Review",
        icon: <IconHistory size={16} />,
      },
      {
        key: "/rasn-naskah/templates",
        path: "/rasn-naskah/templates",
        name: "Template",
        icon: <IconTemplate size={16} />,
      },
      {
        key: "/rasn-naskah/preferences",
        path: "/rasn-naskah/preferences",
        name: "Preferensi",
        icon: <IconSettings size={16} />,
      },
    ];

    // Admin routes (only show if isAdmin)
    const adminRoutes = isAdmin
      ? [
          {
            key: "admin-divider",
            name: "Admin Panel",
            icon: showAdminItems ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            ),
            path: "#",
          },
          ...(showAdminItems
            ? [
                {
                  key: "/rasn-naskah/admin/pergub",
                  path: "/rasn-naskah/admin/pergub",
                  name: "Kelola Pergub",
                  icon: <IconBook size={16} />,
                },
                {
                  key: "/rasn-naskah/admin/dictionary",
                  path: "/rasn-naskah/admin/dictionary",
                  name: "Kamus Istilah",
                  icon: <IconFileText size={16} />,
                },
                {
                  key: "/rasn-naskah/admin/users",
                  path: "/rasn-naskah/admin/users",
                  name: "Kelola Pengguna",
                  icon: <IconUsers size={16} />,
                },
                {
                  key: "/rasn-naskah/admin/dashboard",
                  path: "/rasn-naskah/admin/dashboard",
                  name: (
                    <Space>
                      Dashboard
                      <Badge count="New" size="small" />
                    </Space>
                  ),
                  icon: <IconChartBar size={16} />,
                },
              ]
            : []),
        ]
      : [];

    return [...mainRoutes, ...adminRoutes];
  };

  // Menu item click handler
  const handleMenuClick = ({ key }) => {
    if (key === "admin-divider") {
      setShowAdminItems(!showAdminItems);
      return;
    }

    const route = getAllRoutes().find((r) => r.key === key);
    if (route?.path && route.path !== "#") {
      router.push(route.path);
    }
  };

  return (
    <ProLayout
      title="SAKTI Naskah"
      defaultCollapsed={collapsed}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      selectedKeys={[active]}
      logo={null}
      layout="mix"
      token={layoutToken}
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
                onClick={handleUpload}
                size="middle"
                block
                shape="round"
                type="primary"
                icon={<IconUpload size={16} />}
              >
                Upload Dokumen
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
                  onClick={handleUpload}
                  shape="round"
                  icon={<IconUpload size={16} />}
                  block
                  type="primary"
                >
                  Upload Dokumen
                </Button>
              </Center>
            );
          }
        } else {
          return (
            <Center>
              <Button
                onClick={handleUpload}
                shape="circle"
                size="middle"
                icon={<IconUpload size={16} />}
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
                    if (e.key === "naskah-settings") {
                      router.push("/rasn-naskah/preferences");
                    }
                  },
                  items: [
                    {
                      key: "profile",
                      icon: <IconUser size={16} />,
                      label: "Profil",
                    },
                    {
                      key: "naskah-settings",
                      icon: <IconSettings size={16} />,
                      label: "Pengaturan Naskah",
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
      menuItemRender={(item, dom) => (
        <a onClick={() => handleMenuClick({ key: item.key })}>{dom}</a>
      )}
    >
      {children}
    </ProLayout>
  );
}

export default LayoutRasnNaskah;

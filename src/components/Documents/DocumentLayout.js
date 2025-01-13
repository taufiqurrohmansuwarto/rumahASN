import MegaMenuTop from "@/components/MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "@/components/Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "@/components/Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "@/components/Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "@/components/Notification/NotifikasiPrivateMessage";
import {
  BookOutlined,
  BuildOutlined,
  LogoutOutlined,
  TeamOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { ProConfigProvider } from "@ant-design/pro-components";
import { ConfigProvider, Dropdown, Layout, Space } from "antd";
import frFR from "antd/lib/locale/id_ID";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

function DocumentLayout({ children, active = "rekon-unor" }) {
  const { data } = useSession();

  const menuItems = [
    { key: "dashboard", icon: <BuildOutlined />, label: "Dashboard" },
    {
      key: "pengajuan-tte-webinar",
      icon: <BookOutlined />,
      label: "Pengajuan TTE Webinar",
    },
  ];

  const router = useRouter();

  const token = {
    header: {
      colorBgHeader: "#FAFAFA",
      colorHeaderTitle: "#2E8B57",
    },
    bgLayout: "#FAFAFA",
    colorPrimary: "#2E8B57",
    sider: {
      colorBgCollapsedButton: "#FAFAFA",
      colorTextCollapsedButton: "#2E8B57",
      colorTextCollapsedButtonHover: "#3CB371",
      colorBgMenuItemActive: "#E8F5E9", // Warna hijau muda
      colorTextMenuTitle: "#2E8B57",
      colorTextMenuItemHover: "#3CB371",
      colorTextMenuSelected: "#2E8B57",
      colorTextMenuActive: "#2E8B57",
      colorBgMenuItemHover: "#E8F5E9", // Warna hijau muda
      colorBgMenuItemSelected: "#E8F5E9", // Warna hijau muda
      colorBgMenuItemCollapsedElevated: "#FAFAFA",
      colorTextMenu: "#2E8B57",
      colorBgMenu: "#FAFAFA",
      colorTextMenuSecondary: "#006400",
      colorMenuItemDivider: "#F5F5F5",
    },
    Button: {
      colorPrimary: "#2E8B57",
      colorPrimaryHover: "#3CB371",
    },
  };

  const [collapsed, setCollapsed] = useState(true);

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
            title={"Rekon SIASN"}
            defaultCollapsed={collapsed}
            collapsed={collapsed}
            onCollapse={setCollapsed}
            selectedKeys={[active]}
            logo={null}
            layout="mix"
            navTheme="light"
            fixedHeader
            fixSiderbar
            token={token}
            actionsRender={(props) => {
              // if (props.isMobile) return [];
              return [
                <NotifikasiKepegawaian
                  key="kepegawaian"
                  url="kepegawaian"
                  title="Inbox Kepegawaian"
                />,
                <NotifikasiPrivateMessage
                  key="private-message"
                  url="/mails/inbox"
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
                <MegaMenuTop key="mega-menu" url="" title="Menu" />,
              ];
            }}
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
                            icon: <UserOutlined />,
                            label: "Profil",
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
                  </Space>
                );
              },
            }}
            route={{
              routes: menuItems.map((item) => ({
                path: `/rekon/${item.key}`,
                name: item.label,
                icon: item.icon,
              })),
            }}
            menuItemRender={(item, dom) => (
              <a
                onClick={() => {
                  router.push(`${item.key}`);
                }}
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

export default DocumentLayout;

import MegaMenuTop from "@/components/MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "@/components/Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "@/components/Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "@/components/Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "@/components/Notification/NotifikasiPrivateMessage";
import {
  LogoutOutlined,
  UserOutlined,
  BuildOutlined,
  TeamOutlined,
  BookOutlined,
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

function RekonLayout({ children, active = "rekon-unor" }) {
  const { data } = useSession();

  const menuItems = [
    { key: "rekon-unor", icon: <BuildOutlined />, label: "Unit Organisasi" },
    { key: "rekon-jft", icon: <TeamOutlined />, label: "Jabatan Fungsional" },
    { key: "rekon-diklat", icon: <BookOutlined />, label: "Diklat" },
    { key: "anomali", icon: <WarningOutlined />, label: "Disparitas Data" },
  ];

  const router = useRouter();

  const token = {
    header: {
      colorBgHeader: "#FAFAFA",
      colorHeaderTitle: "#8A2BE2",
    },
    bgLayout: "#FAFAFA",
    colorPrimary: "#8A2BE2",
    sider: {
      colorBgCollapsedButton: "#FAFAFA",
      colorTextCollapsedButton: "#8A2BE2",
      colorTextCollapsedButtonHover: "#9370DB",
      colorBgMenuItemActive: "#F0E6FA", // Diubah ke warna ungu yang lebih muda
      colorTextMenuTitle: "#8A2BE2",
      colorTextMenuItemHover: "#9370DB",
      colorTextMenuSelected: "#8A2BE2",
      colorTextMenuActive: "#8A2BE2",
      colorBgMenuItemHover: "#F0E6FA", // Diubah ke warna ungu yang lebih muda
      colorBgMenuItemSelected: "#F0E6FA", // Diubah ke warna ungu yang lebih muda
      colorBgMenuItemCollapsedElevated: "#FAFAFA",
      colorTextMenu: "#8A2BE2",
      colorBgMenu: "#FAFAFA",
      colorTextMenuSecondary: "#4B0082",
      colorMenuItemDivider: "#F5F5F5",
    },
    Button: {
      colorPrimary: "#8A2BE2",
      colorPrimaryHover: "#9370DB",
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

export default RekonLayout;

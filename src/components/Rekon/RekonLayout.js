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
  ];

  const router = useRouter();

  const token = {
    header: {
      colorBgHeader: "#FFFFFF",
      colorHeaderTitle: "#8A2BE2", // Ungu untuk judul header
    },
    bgLayout: "#FFFFFF",
    colorPrimary: "#8A2BE2", // Warna ungu utama
    sider: {
      colorBgCollapsedButton: "#FFFFFF",
      colorTextCollapsedButton: "#8A2BE2",
      colorTextCollapsedButtonHover: "#9370DB", // Ungu lebih terang saat hover
      colorBgMenuItemActive: "#E6E6FA", // Ungu muda untuk item aktif
      colorTextMenuTitle: "#8A2BE2",
      colorTextMenuItemHover: "#9370DB",
      colorTextMenuSelected: "#8A2BE2", // Ungu untuk teks terpilih
      colorTextMenuActive: "#8A2BE2",
      colorBgMenuItemHover: "#E6E6FA", // Ungu sangat muda saat hover
      colorBgMenuItemSelected: "#F0E6FF",
      colorBgMenuItemCollapsedElevated: "#FFFFFF",
      colorTextMenu: "#8A2BE2",
      colorBgMenu: "#FFFFFF",
      colorTextMenuSecondary: "#4B0082", // Ungu tua untuk teks sekunder
      colorMenuItemDivider: "#F0E6FF",
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

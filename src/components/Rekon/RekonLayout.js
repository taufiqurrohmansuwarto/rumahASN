import MegaMenuTop from "@/components/MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "@/components/Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "@/components/Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "@/components/Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "@/components/Notification/NotifikasiPrivateMessage";
import { appList } from "@/utils/app-lists";
import {
  BookOutlined,
  BuildOutlined,
  LogoutOutlined,
  SunOutlined,
  SyncOutlined,
  TeamOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { ProConfigProvider } from "@ant-design/pro-components";
import { Dropdown, Layout, Space } from "antd";
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
    { key: "pegawai", icon: <UserOutlined />, label: "Daftar Pegawai" },
    { key: "anomali", icon: <WarningOutlined />, label: "Disparitas Data" },
    { key: "rekon-unor", icon: <BuildOutlined />, label: "Unit Organisasi" },
    { key: "rekon-jft", icon: <TeamOutlined />, label: "Jabatan Fungsional" },
    { key: "rekon-jfu", icon: <SunOutlined />, label: "Jabatan Pelaksana" },
    { key: "rekon-jenjang", icon: <BookOutlined />, label: "Jenjang" },
    { key: "rekon-pangkat", icon: <BookOutlined />, label: "Pangkat" },
    {
      key: "rekon-jenis_jabatan",
      icon: <BookOutlined />,
      label: "Jenis Jabatan",
    },
    { key: "rekon-eselon", icon: <BookOutlined />, label: "Eselon" },
    // { key: "rekon-diklat", icon: <BookOutlined />, label: "Diklat" },

    { key: "update-data", icon: <SyncOutlined />, label: "Update Data" },
  ];

  const router = useRouter();

  const token = {
    header: {
      colorBgHeader: "#FAFAFA",
      colorHeaderTitle: "#4B0082", // Indigo
    },
    bgLayout: "#FAFAFA",
    colorPrimary: "#4B0082", // Indigo
    sider: {
      colorBgCollapsedButton: "#FAFAFA",
      colorTextCollapsedButton: "#4B0082", // Indigo
      colorTextCollapsedButtonHover: "#5D1A91", // Indigo hover
      colorBgMenuItemActive: "#E6E6FA", // Indigo muda
      colorTextMenuTitle: "#4B0082", // Indigo
      colorTextMenuItemHover: "#5D1A91", // Indigo hover
      colorTextMenuSelected: "#4B0082", // Indigo
      colorTextMenuActive: "#4B0082", // Indigo
      colorBgMenuItemHover: "#E6E6FA", // Indigo muda
      colorBgMenuItemSelected: "#E6E6FA", // Indigo muda
      colorBgMenuItemCollapsedElevated: "#FAFAFA",
      colorTextMenu: "#4B0082", // Indigo
      colorBgMenu: "#FAFAFA",
      colorTextMenuSecondary: "#2E0050", // Indigo sangat gelap
      colorMenuItemDivider: "#F5F5F5",
    },
    button: {
      colorPrimary: "#4B0082", // Indigo
      colorPrimaryHover: "#5D1A91", // Indigo hover
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
      <ProConfigProvider token={token}>
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
          appList={appList(data?.user)}
        >
          <Layout>{children}</Layout>
        </ProLayout>
      </ProConfigProvider>
    </div>
  );
}

export default RekonLayout;

import MegaMenuTop from "@/components/MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "@/components/Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "@/components/Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "@/components/Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "@/components/Notification/NotifikasiPrivateMessage";
import { layoutToken } from "@/styles/rasn.theme";
import { appList } from "@/utils/app-lists";
import {
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  IconCertificate,
  IconDashboard,
  IconDatabase,
  IconUser,
} from "@tabler/icons-react";
import { Dropdown, Layout, Space } from "antd";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";

const menuItems = [
  {
    key: "dashboard",
    icon: <IconDashboard size={16} />,
    label: "Dashboard",
    role: ["admin"],
  },
  {
    key: "siasn",
    icon: <IconDatabase size={16} />,
    label: "SIASN",
    role: ["admin"],
  },
  {
    key: "bsre",
    icon: <IconCertificate size={16} />,
    label: "Segel & Sertifikat Elektronik",
    role: ["admin"],
  },
  {
    key: "user",
    icon: <IconUser size={16} />,
    label: "Riwayat User",
    role: ["admin"],
  },
];

const getMenuItems = (user) => {
  const admin =
    user?.role === "USER" &&
    user?.group === "MASTER" &&
    user?.current_role === "admin";

  const fasilitator =
    user?.role === "FASILITATOR" &&
    user?.group === "MASTER" &&
    user?.current_role === "user";

  return menuItems.filter((item) => {
    if (admin) return item.role.includes("admin");
    if (fasilitator) return item.role.includes("fasilitator");
    return false;
  });
};

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

function LogLayout({ children, active = "dashboard" }) {
  const { data } = useSession();

  const router = useRouter();

  const [collapsed, setCollapsed] = useState(true);

  return (
    <div
      style={{
        height: "100vh",
        overflow: "auto",
      }}
    >
      <ProLayout
        title={"History Log User"}
        defaultCollapsed={collapsed}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        selectedKeys={[active]}
        logo={null}
        layout="mix"
        navTheme="light"
        fixedHeader
        fixSiderbar
        token={layoutToken}
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
          routes: getMenuItems(data?.user).map((item) => ({
            path: `/logs/${item.key}`,
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
    </div>
  );
}

export default LogLayout;

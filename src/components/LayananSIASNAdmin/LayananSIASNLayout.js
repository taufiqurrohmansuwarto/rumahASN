import MegaMenuTop from "@/components/MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "@/components/Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "@/components/Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "@/components/Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "@/components/Notification/NotifikasiPrivateMessage";
import { appList } from "@/utils/app-lists";
import {
  ArrowUpOutlined,
  DashboardOutlined,
  LogoutOutlined,
  StopOutlined,
  UserAddOutlined,
  UserOutlined,
  ArrowsAltOutlined,
} from "@ant-design/icons";
import { ProConfigProvider } from "@ant-design/pro-components";
import { Dropdown, Layout, Space } from "antd";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import { getMenuItems } from "@/utils/appLists";

const token = {};

const menuItems = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
    role: ["admin"],
  },
  {
    key: "kenaikan-pangkat",
    icon: <ArrowUpOutlined />,
    label: "Kenaikan Pangkat",
    role: ["admin"],
  },
  {
    key: "pemberhentian",
    icon: <StopOutlined />,
    label: "Pemberhentian",
    role: ["admin"],
  },
  {
    key: "pengadaan",
    icon: <UserAddOutlined />,
    label: "Pengadaan",
    role: ["admin"],
  },
  {
    key: "imut",
    icon: <ArrowUpOutlined />,
    label: "Integrated Mutasi",
    role: ["prakom"],
  },
];

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

function LayananSIASNLayout({ children, active = "dashboard" }) {
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
      <ProConfigProvider token={token}>
        <ProLayout
          title={"Layanan SIASN"}
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
            routes: getMenuItems(menuItems, data?.user).map((item) => ({
              path: `/layanan-siasn/${item.key}`,
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

export default LayananSIASNLayout;

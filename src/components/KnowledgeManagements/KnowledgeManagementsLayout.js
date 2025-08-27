import MegaMenuTop from "@/components/MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "@/components/Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "@/components/Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "@/components/Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "@/components/Notification/NotifikasiPrivateMessage";
import { appList } from "@/utils/app-lists";
import { getMenuItems } from "@/utils/appLists";
import {
  DashboardOutlined,
  FileOutlined,
  FileTextOutlined,
  LogoutOutlined,
  StarOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ProConfigProvider } from "@ant-design/pro-components";
import { Dropdown, Layout, Space } from "antd";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";

const token = {};

const menuItems = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
    role: ["admin"],
  },
  {
    key: "contents",
    icon: <FileTextOutlined />,
    label: "Contents",
    role: ["admin"],
  },
  {
    key: "referensi",
    icon: <FileOutlined />,
    label: "Referensi",
    role: ["admin"],
    children: [
      {
        key: "categories",
        icon: <FileOutlined />,
        label: "Categories",
        role: ["admin"],
      },
      {
        key: "badges",
        icon: <StarOutlined />,
        label: "Badges",
        role: ["admin"],
      },
      {
        key: "missions",
        icon: <TrophyOutlined />,
        label: "Missions",
        role: ["admin"],
      },
    ],
  },
];

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

function KnowledgeManagementsLayout({ children, active = "dashboard" }) {
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
          title={"ASNPedia"}
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
              path: `/knowledge-managements/${item.key}`,
              name: item.label,
              icon: item.icon,
              children: item.children?.map((child) => ({
                path: `/knowledge-managements/${child.key}`,
                name: child.label,
                icon: child.icon,
              })),
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

export default KnowledgeManagementsLayout;

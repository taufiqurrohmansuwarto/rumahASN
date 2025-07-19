import MegaMenuTop from "@/components/MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "@/components/Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "@/components/Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "@/components/Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "@/components/Notification/NotifikasiPrivateMessage";
import {
  BookOutlined,
  DashboardOutlined,
  LogoutOutlined,
  UserOutlined,
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

function DocumentLayout({ children, active = "rekon-unor" }) {
  const { data } = useSession();

  const menuItems = [
    { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
    {
      key: "tte-webinar",
      icon: <BookOutlined />,
      label: "TTE Webinar",
    },
  ];

  const router = useRouter();

  const [collapsed, setCollapsed] = useState(true);

  return (
    <div
      style={{
        height: "100vh",
        overflow: "auto",
      }}
    >
      <ProConfigProvider>
        <ProLayout
          title={"Dokumen"}
          defaultCollapsed={collapsed}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          selectedKeys={[active]}
          logo={null}
          layout="mix"
          navTheme="light"
          fixedHeader
          fixSiderbar
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
              path: `/documents/${item.key}`,
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
    </div>
  );
}

export default DocumentLayout;

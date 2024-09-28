import MegaMenu from "@/components/MegaMenu/MegaMenu";
import NotifikasiASNConnect from "@/components/Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "@/components/Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "@/components/Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "@/components/Notification/NotifikasiPrivateMessage";
import {
  BookOutlined,
  EditOutlined,
  InboxOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { ProConfigProvider } from "@ant-design/pro-components";
import { Center } from "@mantine/core";
import { Button, ConfigProvider, Layout } from "antd";
import idID from "antd/lib/locale/id_ID";
import dynamic from "next/dynamic";
import { useState } from "react";
import { GuestBookToken } from "./GuestBookToken";

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

function GuestBookLayout({ children, active = "main" }) {
  const menuItems = [
    { key: "main", icon: <InboxOutlined />, label: "Kunjungan" },
    { key: "check-in", icon: <CheckCircleOutlined />, label: "Check In" },
    { key: "check-out", icon: <CloseCircleOutlined />, label: "Check Out" },
    { key: "setting", icon: <SettingOutlined />, label: "Pengaturan" },
  ];

  const [collapsed, setCollapsed] = useState(true);

  return (
    <ConfigProvider
      locale={idID}
      theme={{
        token: GuestBookToken,
      }}
    >
      <ProConfigProvider>
        <ProLayout
          title="TemuBKD"
          defaultCollapsed={collapsed}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          selectedKeys={[active]}
          logo={<BookOutlined style={{ color: "#2E7D32" }} />}
          layout="mix"
          navTheme="light"
          contentWidth="Fluid"
          fixedHeader
          fixSiderbar
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
                    onClick={() => {}}
                    size="middle"
                    shape="round"
                    type="primary"
                    icon={<EditOutlined />}
                  >
                    Tulis Pesan
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
                      onClick={() => {}}
                      shape="round"
                      icon={<EditOutlined />}
                      block
                      type="primary"
                    >
                      Tulis Pesan
                    </Button>
                  </Center>
                );
              }
            } else {
              return (
                <Center>
                  <Button
                    onClick={() => {}}
                    shape="circle"
                    size="middle"
                    icon={<EditOutlined />}
                    type="primary"
                  />
                </Center>
              );
            }
          }}
          token={GuestBookToken}
          route={{
            routes: menuItems.map((item) => ({
              path: `/guest-book/${item.key}`,
              name: item.label,
              icon: item.icon,
            })),
          }}
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
              <MegaMenu key="mega-menu" />,
            ];
          }}
          menuItemRender={(item, dom) => (
            <a
              onClick={() => {
                console.log("Clicked:", item.name);
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
  );
}

export default GuestBookLayout;

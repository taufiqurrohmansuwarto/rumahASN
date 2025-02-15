import {
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  MailOutlined,
  SendOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { ProConfigProvider } from "@ant-design/pro-components";
import { Center } from "@mantine/core";
import { Button, ConfigProvider, Layout } from "antd";
import frFR from "antd/lib/locale/id_ID";
import dynamic from "next/dynamic";
import { useState } from "react";

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

function GmailLayout({ children, active = "inbox" }) {
  const menuItems = [
    { key: "inbox", icon: <InboxOutlined />, label: "Kotak Masuk" },
    { key: "sent", icon: <SendOutlined />, label: "Pesan Terkirim" },
    { key: "starred", icon: <StarOutlined />, label: "Ditandai" },
    { key: "trash", icon: <DeleteOutlined />, label: "Sampah" },
  ];

  const token = {
    header: {
      colorBgHeader: "#FFFFFF",
      colorHeaderTitle: "#5F6368",
    },
    bgLayout: "#FFFFFF",
    colorPrimary: "#EA4335", // Gmail red
    sider: {
      colorBgCollapsedButton: "#FFFFFF",
      colorTextCollapsedButton: "#5F6368",
      colorTextCollapsedButtonHover: "#202124",
      colorBgMenuItemActive: "#FCE8E6", // Light red for active item
      colorTextMenuTitle: "#5F6368",
      colorTextMenuItemHover: "#202124",
      colorTextMenuSelected: "#D93025", // Darker red for selected text
      colorTextMenuActive: "#D93025",
      colorBgMenuItemHover: "#F1F3F4",
      colorBgMenuItemSelected: "#FCE8E6",
      colorBgMenuItemCollapsedElevated: "#FFFFFF",
      colorTextMenu: "#5F6368",
      colorBgMenu: "#FFFFFF",
      colorTextMenuSecondary: "#5F6368",
      colorMenuItemDivider: "#E8EAED",
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
            title="Mail ASN"
            defaultCollapsed={collapsed}
            collapsed={collapsed}
            onCollapse={setCollapsed}
            selectedKeys={[active]}
            logo={<MailOutlined style={{ color: "#EA4335" }} />}
            layout="mix"
            navTheme="light"
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
                      Compose
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
                        Compose
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
            token={token}
            route={{
              routes: menuItems.map((item) => ({
                path: `/mails/${item.key}`,
                name: item.label,
                icon: item.icon,
              })),
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
    </div>
  );
}

export default GmailLayout;

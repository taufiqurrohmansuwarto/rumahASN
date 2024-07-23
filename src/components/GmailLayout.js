import {
  DeleteOutlined,
  InboxOutlined,
  MailOutlined,
  SendOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { ConfigProvider, Layout } from "antd";
import dynamic from "next/dynamic";
import { useState } from "react";
import frFR from "antd/lib/locale/id_ID";
import { ProConfigProvider } from "@ant-design/pro-components";

const { Header, Content, Sider } = Layout;

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

function GmailLayout({ children, active = "inbox" }) {
  const menuItems = [
    { key: "inbox", icon: <InboxOutlined />, label: "Inbox" },
    { key: "sent", icon: <SendOutlined />, label: "Sent" },
    { key: "starred", icon: <StarOutlined />, label: "Starred" },
    { key: "trash", icon: <DeleteOutlined />, label: "Trash" },
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
    Button: {},
  };

  const [collapsed, setCollapsed] = useState(true);

  return (
    <ConfigProvider
      locale={frFR}
      theme={{
        token: token,
      }}
    >
      <ProConfigProvider>
        <ProLayout
          title="RMail"
          defaultCollapsed={collapsed}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          selectedKeys={[active]}
          logo={<MailOutlined style={{ color: "#EA4335" }} />}
          layout="mix"
          navTheme="light"
          contentWidth="Fluid"
          fixedHeader
          fixSiderbar
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
  );
}

export default GmailLayout;

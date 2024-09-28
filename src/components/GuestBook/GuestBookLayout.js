import MegaMenu from "@/components/MegaMenu/MegaMenu";
import NotifikasiASNConnect from "@/components/Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "@/components/Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "@/components/Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "@/components/Notification/NotifikasiPrivateMessage";
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  InboxOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { ProConfigProvider } from "@ant-design/pro-components";
import { Center } from "@mantine/core";
import { Button, ConfigProvider, Layout } from "antd";
import idID from "antd/lib/locale/id_ID";
import dynamic from "next/dynamic";
import { useState } from "react";
import { GuestBookToken } from "./GuestBookToken";
import Link from "next/link";

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

const menuItemRender = (options, element) => {
  return (
    <Link href={`${options.path}`}>
      <a>{element}</a>
    </Link>
  );
};

function GuestBookLayout({ children, active = "main" }) {
  const menuItems = [
    { key: "main", icon: <InboxOutlined />, label: "Kunjungan" },
    {
      key: "all-visit",
      icon: <CalendarOutlined />,
      label: "Semua Kunjungan",
    },
    {
      key: "my-guest",
      icon: <UsergroupAddOutlined />,
      label: "Tamu Saya",
    },
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
          selectedKeys={[active ? `/guests-books/${active}` : router.pathname]}
          logo={<BookOutlined style={{ color: "#2E7D32" }} />}
          layout="mix"
          navTheme="light"
          contentWidth="Fluid"
          fixedHeader
          fixSiderbar
          token={GuestBookToken}
          route={{
            routes: menuItems.map((item) => ({
              path: `/guests-books/${item.key}`,
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
          menuItemRender={menuItemRender}
        >
          <Layout>{children}</Layout>
        </ProLayout>
      </ProConfigProvider>
    </ConfigProvider>
  );
}

export default GuestBookLayout;

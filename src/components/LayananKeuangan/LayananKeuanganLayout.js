import MegaMenuTop from "@/components/MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "@/components/Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "@/components/Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "@/components/Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "@/components/Notification/NotifikasiPrivateMessage";
import { appList } from "@/utils/app-lists";
import { getMenuItems, mappingItems } from "@/utils/appLists";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { ProConfigProvider } from "@ant-design/pro-components";
import {
  IconBuildingSkyscraper,
  IconHistory,
  IconRotateRectangle,
  IconWallet,
} from "@tabler/icons-react";
import { Dropdown, Space } from "antd";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import { layananKeuanganToken } from "src/styles/layanan-keuangan.styles";

const menuItems = [
  {
    key: "/dashboard",
    icon: <IconWallet size={16} />,
    label: "Dashboard",
    role: ["asn", "admin"],
  },
  {
    key: "/bank-jatim/produk/kkb",
    icon: <IconBuildingSkyscraper size={16} />,
    label: "Bank Jatim",
    role: ["asn", "admin"],
  },
];

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

function RekonLayout({ children, active = "layanan-keuangan" }) {
  const { data } = useSession();

  const router = useRouter();

  const [collapsed, setCollapsed] = useState(true);

  return (
    <ProConfigProvider>
      <ProLayout
        title={"Layanan Keuangan"}
        defaultCollapsed={collapsed}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        selectedKeys={[active]}
        logo={null}
        layout="mix"
        navTheme="light"
        // fixedHeader
        // fixSiderbar
        token={layananKeuanganToken}
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
          routes: mappingItems(
            getMenuItems(menuItems, data?.user),
            "/layanan-keuangan"
          ),
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
        {children}
      </ProLayout>
    </ProConfigProvider>
  );
}

export default RekonLayout;

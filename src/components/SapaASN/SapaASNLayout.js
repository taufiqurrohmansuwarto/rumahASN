import MegaMenuTop from "@/components/MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "@/components/Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "@/components/Notification/NotifikasiForumKepegawaian";
import { layoutToken } from "@/styles/rasn.theme";
import { appList } from "@/utils/app-lists";
import { getMenuItems, mappingItems } from "@/utils/appLists";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import {
  IconDashboard,
  IconGavel,
  IconMessageQuestion,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Dropdown, Space } from "antd";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";

const menuItems = [
  {
    key: "/dashboard",
    icon: <IconDashboard size={16} />,
    label: "Dashboard",
    role: ["asn"],
  },
  {
    key: "/advokasi",
    icon: <IconGavel size={16} />,
    label: "Pengaduan & Advokasi",
    role: ["asn"],
  },
  {
    key: "/konsultasi-hukum",
    icon: <IconMessageQuestion size={16} />,
    label: "Konsultasi Hukum",
    role: ["asn"],
  },
  {
    key: "/pendampingan-hukum",
    icon: <IconShieldCheck size={16} />,
    label: "Pendampingan Hukum",
    role: ["asn"],
  },
];

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

function SapaASNLayout({ children, active = "advokasi" }) {
  const { data } = useSession();

  const router = useRouter();

  const [collapsed, setCollapsed] = useState(true);

  return (
    <ProLayout
      title={"Sapa ASN"}
      defaultCollapsed={collapsed}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      selectedKeys={[active]}
      logo={null}
      layout="mix"
      token={layoutToken}
      actionsRender={(props) => {
        return [
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
        render: (_, dom) => {
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
        routes: mappingItems(getMenuItems(menuItems, data?.user), "/sapa-asn"),
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
  );
}

export default SapaASNLayout;

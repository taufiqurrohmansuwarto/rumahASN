import MegaMenuTop from "@/components/MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "@/components/Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "@/components/Notification/NotifikasiForumKepegawaian";
import { layoutToken } from "@/styles/rasn.theme";
import { appList } from "@/utils/app-lists";
import { getMenuItems, mappingItems } from "@/utils/appLists";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import {
    IconDashboard,
    IconHistory
} from "@tabler/icons-react";
import { Dropdown, Space } from "antd";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";

const menuItems = [
  {
    key: "/formasi",
    icon: <IconDashboard size={16} />,
    label: "Formasi",
    role: ["admin","fasilitator"],
  },
  {
    key: "/audit-log",
    icon: <IconHistory size={16} />,
    label: "Audit Log",
    role: ["admin","fasilitator"],
  },
];

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

function PerencanaanFormasiLayout({ children, active = "/formasi" }) {
  const { data } = useSession();

  const router = useRouter();

  const [collapsed, setCollapsed] = useState(true);

  return (
    <ProLayout
      title={"Perencanaan Formasi"}
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
        routes: mappingItems(getMenuItems(menuItems, data?.user), "/perencanaan"),
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

export default PerencanaanFormasiLayout;

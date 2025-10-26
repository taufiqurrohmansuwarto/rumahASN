import { layoutToken } from "@/styles/rasn.theme";
import { appList } from "@/utils/app-lists";
import { getMenuItems, mappingItems } from "@/utils/appLists";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import {
  IconHome,
  IconInbox,
  IconSend,
  IconSignature,
  IconClipboardList,
} from "@tabler/icons-react";
import { Dropdown, Space } from "antd";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";

const menuItems = [
  {
    key: "/kominfo-services/dashboard",
    icon: <IconHome size={16} />,
    label: "Beranda",
    role: ["asn"],
  },
  {
    key: "/kominfo-services/email",
    icon: <IconInbox size={16} />,
    label: "Email Aktif",
    role: ["asn"],
  },
  {
    key: "/kominfo-services/tte",
    icon: <IconSignature size={16} />,
    label: "Tanda Tangan Elektronik",
    role: ["asn"],
  },
  {
    key: "/kominfo-services/tte-submission",
    icon: <IconClipboardList size={16} />,
    label: "Kelola Pengajuan TTE",
    role: ["prakom", "kominfo"],
  },
  {
    key: "/kominfo-services/email-submission",
    icon: <IconSend size={16} />,
    label: "Kelola Email",
    role: ["prakom", "kominfo"],
  },
];

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

function KominfoServicesLayout({ children, active = "/" }) {
  const { data } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <ProLayout
      title={"Layanan Kominfo Jatim"}
      defaultCollapsed={collapsed}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      selectedKeys={[active]}
      logo={null}
      layout="mix"
      token={layoutToken}
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
        routes: mappingItems(getMenuItems(menuItems, data?.user), ""),
      }}
      menuItemRender={(item, dom) => (
        <a
          onClick={() => {
            router.push(item.key);
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

export default KominfoServicesLayout;

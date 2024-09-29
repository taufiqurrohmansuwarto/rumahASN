import { currentUserRole } from "@/services/current-user.services";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  LogoutOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { ProConfigProvider } from "@ant-design/pro-components";
import { Text } from "@mantine/core";
import { ConfigProvider, Dropdown, Grid, Layout } from "antd";
import idID from "antd/lib/locale/id_ID";
import { useSession, signOut } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import ActionSettings from "../ActionSettings";
import { GuestBookToken } from "./GuestBookToken";

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

const menuItems = [
  {
    key: "main",
    icon: <InboxOutlined />,
    name: "Kunjungan",
    role: null,
    path: "/guests-books/main",
  },
  {
    key: "all-visit",
    icon: <CalendarOutlined />,
    name: "Semua Kunjungan",
    path: "/guests-books/all-visit",
    role: ["admin", "agent"],
  },
  {
    key: "my-guest",
    icon: <UsergroupAddOutlined />,
    name: "Tamu Saya",
    role: ["admin", "agent"],
    path: "/guests-books/my-guest",
  },
  {
    key: "check-in",
    icon: <CheckCircleOutlined />,
    name: "Check In",
    role: ["admin", "agent"],
    path: "/guests-books/check-in",
  },
  {
    key: "check-out",
    icon: <CloseCircleOutlined />,
    name: "Check Out",
    role: ["admin", "agent"],
    path: "/guests-books/check-out",
  },
  {
    key: "setting",
    icon: <SettingOutlined />,
    name: "Pengaturan",
    role: null,
    path: "/guests-books/setting",
  },
];

const changeRoutes = async (user) => {
  const role = user?.current_role;
  const bkd = user?.organization_id?.startsWith("123");
  const pttBkd = user?.organization_id?.startsWith("134");

  const admin = (role === "admin" && bkd) || (role === "admin" && pttBkd);
  const agent = (role === "agent" && bkd) || (role === "agent" && pttBkd);

  const routes = menuItems.filter((item) => {
    if (item.role) {
      return item.role.includes(role);
    } else {
      return true;
    }
  });

  return new Promise((resolve, reject) => {
    resolve(routes);
  });
};

const FooterRender = () => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <div
      style={{
        textAlign: "center",
        marginBottom: 20,
      }}
    >
      <Text
        style={{
          fontSize: breakPoint.xs ? 13 : 14,
        }}
        type="secondary"
      >
        Desain dan Pengembangan
      </Text>
      <div>
        <Text
          style={{
            fontSize: breakPoint.xs ? 13 : 14,
          }}
          type="secondary"
        >
          © 2022 BKD Provinsi Jawa Timur
        </Text>
      </div>
    </div>
  );
};

function GuestBookLayout({ children, active = "main" }) {
  const [collapsed, setCollapsed] = useState(true);
  const breakPoint = Grid.useBreakpoint();
  const { data, status } = useSession();

  return (
    <ConfigProvider
      locale={idID}
      theme={{
        token: GuestBookToken,
      }}
    >
      <ProConfigProvider>
        <ProLayout
          loading={status === "loading"}
          title="TemuBKD"
          defaultCollapsed={collapsed}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          selectedKeys={[active ? active : router.pathname]}
          layout="mix"
          navTheme="light"
          contentWidth="Fluid"
          fixedHeader
          fixSiderbar
          avatarProps={{
            src: data?.user?.image,
            size: "large",
            render: (props, dom) => {
              return (
                <Dropdown
                  menu={{
                    onClick: (e) => {
                      if (e.key === "logout") {
                        signOut();
                      }
                    },
                    items: [
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
              );
            },
          }}
          token={GuestBookToken}
          menu={{
            request: async () => {
              const userRole = await currentUserRole();
              const payload = {
                ...data?.user,
                app_role: userRole,
              };
              const user = await changeRoutes(payload);
              return user;
            },
          }}
          footerRender={FooterRender}
          actionsRender={ActionSettings}
          menuItemRender={menuItemRender}
        >
          <Layout>{children}</Layout>
        </ProLayout>
      </ProConfigProvider>
    </ConfigProvider>
  );
}

export default GuestBookLayout;

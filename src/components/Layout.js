import {
  LogoutOutlined,
  NotificationOutlined,
  ReconciliationOutlined,
  SettingOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { Dropdown, Menu } from "antd";
import { uniqBy } from "lodash";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { userRoutes } from "../routes";
import Notifications from "./Notifications";

const menu = (
  <Menu
    items={[
      {
        key: "1",
        label: "Notifikasi",
        icon: <NotificationOutlined />,
      },
      {
        key: "2",
        label: "Keluar",

        icon: <LogoutOutlined />,
      },
    ]}
  />
);

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

const changeRoutes = (user) => {
  return new Promise((resolve, reject) => {
    const role = user?.current_role;
    const bkd = user?.organization_id?.startsWith("123");
    const pttBkd = user?.organization_id?.startsWith("134");

    const admin = (role === "admin" && bkd) || (role === "admin" && pttBkd);
    const agent = (role === "agent" && bkd) || (role === "agent" && pttBkd);
    const userPns = user?.group === "MASTER";

    if (userPns) {
      userRoutes.routes.push({
        path: "/layanan-tracking",
        name: "Layanan Tracking",
        icon: <ReconciliationOutlined />,
        routes: [
          {
            path: "/layanan-tracking/siasn",
            name: "SIASN",
            icon: <UserOutlined />,
          },
          {
            path: "/layanan-tracking/simaster",
            name: "SIMASTER",
            icon: <UserOutlined />,
          },
        ],
      });
    }

    if (admin) {
      userRoutes.routes.push(
        {
          path: "/agent/dashboard",
          name: "Agent",
          icon: <UserSwitchOutlined />,
        },
        {
          path: "/admin/dashboard",
          name: "Admin",
          icon: <UserOutlined />,
        }
      );
    }

    if (agent) {
      userRoutes.routes.push({
        path: "/agent/dashboard",
        name: "Agent",
        icon: <UserOutlined />,
      });
    }

    const routes = uniqBy(userRoutes.routes, "path");

    resolve(routes);
  });
};

// when click menu, it will redirect to the page
const menuItemRender = (options, element) => {
  return (
    <Link href={`${options.path}`}>
      <a>{element}</a>
    </Link>
  );
};

function Layout({ children, active }) {
  const { data, status } = useSession();
  const router = useRouter();

  return (
    <ProLayout
      theme="light"
      selectedKeys={[active ? active : router.pathname]}
      title="Konsultasi Online"
      menuFooterRender={(props) => {
        if (props?.collapsed) return undefined;
        return (
          <div
            style={{
              textAlign: "center",
              paddingBlockStart: 12,
            }}
          >
            <div>© 2023 BKD Helpdesk</div>
            <div>by BKD Provinsi Jawa Timur</div>
          </div>
        );
      }}
      actionsRender={(props) => {
        // if (props.isMobile) return [];
        return [<Notifications key="Notifications" />];
      }}
      avatarProps={{
        src: data?.user?.image,
        size: "small",
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
                    key: "setting",
                    icon: <SettingOutlined />,
                    label: "Pengaturan",
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
          );
        },
      }}
      // defaultCollapsed={true}
      menu={{
        request: async () => {
          try {
            const user = await changeRoutes(data?.user);
            return user;
          } catch (e) {
            console.log(e);
          }
        },
        defaultOpenAll: true,
      }}
      menuItemRender={menuItemRender}
      layout="mix"
      loading={status === "loading"}
    >
      {children}
    </ProLayout>
  );
}

export default Layout;

import { UserOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { uniqBy } from "lodash";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { userRoutes } from "../routes";

const ProLayout = dynamic(
  () => import("@ant-design/pro-layout").then((mod) => mod.ProLayout),
  {
    ssr: false,
  }
);

const changeRoutes = (user) => {
  return new Promise((resolve, reject) => {
    const role = user?.current_role;
    const bkd = user?.organization_id?.startsWith("123");

    const admin = role === "admin" && bkd;
    const agent = role === "agent" && bkd;

    if (admin) {
      userRoutes.routes.push(
        {
          path: "/admin/dashboard",
          name: "Admin",
          icon: <UserOutlined />,
        },
        {
          path: "/agent/dashboard",
          name: "Agent",
          icon: <UserSwitchOutlined />,
        }
      );

      const routes = uniqBy(userRoutes.routes, "path");

      resolve(routes);
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
      selectedKeys={[active ? active : router.pathname]}
      title="Testing"
      avatarProps={{
        src: data?.user?.image,
        size: "default",
        title: data?.user?.name,
      }}
      menu={{
        request: async () => {
          try {
            const user = await changeRoutes(data?.user);
            return user;
          } catch (e) {
            console.log(e);
          }
        },
      }}
      menuItemRender={menuItemRender}
      loading={status === "loading"}
    >
      {children}
    </ProLayout>
  );
}

export default Layout;

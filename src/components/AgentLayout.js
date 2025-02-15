import { LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { agentRoutes } from "../routes";
import Notifications from "./Notifications";

const ProLayout = dynamic(
  () => import("@ant-design/pro-layout").then((mod) => mod.ProLayout),
  {
    ssr: false,
  }
);

// when click menu, it will redirect to the page
const menuItemRender = (options, element) => {
  return <Link href={`${options.path}`}>{element}</Link>;
};

function AgentLayout({ children, active, title = "Agent" }) {
  const { data, status } = useSession();
  const router = useRouter();

  return (
    <ProLayout
      selectedKeys={[active ? active : router.pathname]}
      title="Penerima Tugas"
      headerTitleRender={(logo, title) => {
        return (
          <>
            <Link href="/feeds">{logo}</Link>
            {title}
          </>
        );
      }}
      actionsRender={() => {
        return [<Notifications key="notifications" />];
      }}
      layout="mix"
      theme="light"
      // splitMenus={true}
      location={{
        pathname: router.pathname,
      }}
      menu={{
        defaultOpenAll: true,
      }}
      avatarProps={{
        src: data?.user?.image,
        size: "default",
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
      menuItemRender={menuItemRender}
      route={agentRoutes}
      loading={status === "loading"}
    >
      {children}
    </ProLayout>
  );
}

export default AgentLayout;

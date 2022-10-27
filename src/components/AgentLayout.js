import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { agentRoutes } from "../routes";
import Notifications from "./Notifications";
import SignoutButton from "./SignoutButton";

const ProLayout = dynamic(
  () => import("@ant-design/pro-layout").then((mod) => mod.ProLayout),
  {
    ssr: false,
  }
);

// when click menu, it will redirect to the page
const menuItemRender = (options, element) => {
  return (
    <Link href={`${options.path}`}>
      <a>{element}</a>
    </Link>
  );
};

function AgentLayout({ children, active }) {
  const { data, status } = useSession();
  const router = useRouter();

  return (
    <ProLayout
      selectedKeys={[active ? active : router.pathname]}
      title="Agent"
      actionsRender={() => {
        return [
          <Notifications key="notifications" />,
          <SignoutButton key="signout" />,
        ];
      }}
      // layout="mix"
      // splitMenus={true}
      location={{
        pathname: router.pathname,
      }}
      menuHeaderRender={(logo, title) => (
        <Link href="/">
          <a>
            {logo}
            {title}
          </a>
        </Link>
      )}
      headerTitleRender={(logo, title) => {
        return (
          <Link href="/feeds">
            <a>{title} </a>
          </Link>
        );
      }}
      avatarProps={{
        src: data?.user?.image,
        size: "default",
        title: data?.user?.name,
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

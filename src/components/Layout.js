import { SmileOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React from "react";
import PageContainer from "./PageContainer";

const ProLayout = dynamic(
  () => import("@ant-design/pro-layout").then((mod) => mod.ProLayout),
  {
    ssr: false,
  }
);

const routes = {
  routes: [{ path: "/feeds", name: "test", icon: <SmileOutlined /> }],
};

function Layout({ children }) {
  const { data, status } = useSession();
  const router = useRouter();

  return (
    <ProLayout
      selectedKeys={[router.pathname]}
      title="SIASN Helpdesk"
      avatarProps={{
        src: data?.user?.image,
        size: "default",
        title: data?.user?.name,
      }}
      route={routes}
      loading={status === "loading"}
    >
      <PageContainer>{children}</PageContainer>
    </ProLayout>
  );
}

export default Layout;

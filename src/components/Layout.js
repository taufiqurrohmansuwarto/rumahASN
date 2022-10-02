import { SmileOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import React from "react";
import PageContainer from "./PageContainer";

const ProLayout = dynamic(
  () => import("@ant-design/pro-layout").then((mod) => mod.ProLayout),
  {
    ssr: false,
  }
);

const routes = {
  routes: [{ path: "/welcome", name: "test", icon: <SmileOutlined /> }],
};

function Layout({ children }) {
  const { data, status } = useSession();

  return (
    <div style={{ height: "100vh" }}>
      <ProLayout
        route={routes}
        loading={status === "loading"}
        menu={{
          type: "group",
        }}
        menuFooterRender={(props) => {
          if (props?.collapsed) return undefined;
          return (
            <div
              style={{
                textAlign: "center",
                paddingBlockStart: 12,
              }}
            >
              <div>© 2021 Made with love</div>
              <div>by Ant Design</div>
            </div>
          );
        }}
        title="Helpdesk"
        bgLayoutImgList={[
          {
            src: "https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png",
            left: 85,
            bottom: 100,
            height: "303px",
          },
          {
            src: "https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png",
            bottom: -68,
            right: -45,
            height: "303px",
          },
          {
            src: "https://img.alicdn.com/imgextra/i3/O1CN018NxReL1shX85Yz6Cx_!!6000000005798-2-tps-884-496.png",
            bottom: 0,
            left: 0,
            width: "331px",
          },
        ]}
        actionsRender={(props) => {
          if (props.isMobile) return [];
          return [];
        }}
      >
        <PageContainer title="test">{children}</PageContainer>
      </ProLayout>
    </div>
  );
}

export default Layout;

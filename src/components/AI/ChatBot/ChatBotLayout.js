import ActionSettings from "@/components/ActionSettings";
import { GuestBookToken } from "@/components/GuestBook/GuestBookToken";
import { LogoutOutlined } from "@ant-design/icons";
import { ProConfigProvider } from "@ant-design/pro-components";
import { Text } from "@mantine/core";
import { ConfigProvider, Dropdown, Grid, Layout } from "antd";
import idID from "antd/lib/locale/id_ID";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

const menuItemRender = (options, element) => {
  return <Link href={`${options.path}`}>{element}</Link>;
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

function ChatBotLayout({ children, active }) {
  const [collapsed, setCollapsed] = useState(true);
  const { data, status } = useSession();
  const router = useRouter();
  const curentActive = active ? active : router.pathname;

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
          title="BESTIE AI"
          defaultCollapsed={collapsed}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          selectedKeys={[curentActive]}
          layout="top"
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
          actionsRender={ActionSettings}
          menuItemRender={menuItemRender}
        >
          <Layout>{children}</Layout>
        </ProLayout>
      </ProConfigProvider>
    </ConfigProvider>
  );
}

export default ChatBotLayout;

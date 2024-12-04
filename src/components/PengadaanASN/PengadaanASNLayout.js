import ActionSettings from "@/components/ActionSettings";
import { GuestBookToken } from "@/components/GuestBook/GuestBookToken";
import { LogoutOutlined } from "@ant-design/icons";
import { ProConfigProvider } from "@ant-design/pro-components";
import { ConfigProvider, Dropdown, Layout } from "antd";
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

function PengadaanASNLayout({ children, active }) {
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
          title=""
          logo="https://siasn.bkd.jatimprov.go.id:9000/public/bestie-ai-title.png"
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

export default PengadaanASNLayout;

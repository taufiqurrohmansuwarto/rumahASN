import { appList } from "@/utils/app-lists";
import {
  CommentOutlined,
  LogoutOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Dropdown, Grid, Typography } from "antd";
import { uniqBy } from "lodash";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const userRoutes = {
  routes: [
    {
      path: "/asn-connect/asn-updates",
      name: "ASN Updates",
      icon: <UserOutlined />,
    },
    {
      path: "/asn-connect/asn-discussions",
      name: "ASN Discussion",
      icon: <CommentOutlined />,
    },
    {
      path: "/asn-connect/asn-virtual-meet",
      name: "ASN Virtual Meet",
      icon: <VideoCameraOutlined />,
    },
  ],
};
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
    const userPns = user?.group === "MASTER" && user?.role === "USER";
    const userPttpk = user?.group === "PTTPK" && user?.role === "USER";

    const fasilitatorMaster =
      user?.group === "MASTER" && user?.role === "FASILITATOR";

    const pegawaiPemda = userPns || userPttpk;
    const pegawaiBKD = bkd || pttBkd;

    const adminFasilitator = admin || fasilitatorMaster;

    // persiapan ini seharusnya ditambahkan halaman dashboard seperti analisis dsb tapi jangan data

    if (adminFasilitator) {
    }

    if (pegawaiBKD) {
    }

    if (fasilitatorMaster) {
    }

    if (pegawaiPemda) {
    }

    if (userPns) {
    }

    if (admin) {
    }

    if (agent) {
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

function LayoutAsnConnect({ children, active, collapsed = true }) {
  const { data, status } = useSession();
  const router = useRouter();
  const [tutup, setTutup] = useState(collapsed);

  const breakPoint = Grid.useBreakpoint();

  const onCollapsed = () => {
    setTutup(!tutup);
  };

  return (
    <ProLayout
      theme="light"
      selectedKeys={[active ? active : router.pathname]}
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
      title="ASN Connect"
      logo={"https://siasn.bkd.jatimprov.go.id:9000/public/logobkd.jpg"}
      headerTitleRender={(logo, title) => {
        const defaultDom = (
          <>
            <Link href="/feeds">
              <a>{logo}</a>
            </Link>
            {title}
          </>
        );

        return defaultDom;
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
            <Typography.Text
              style={{
                fontSize: breakPoint.xs ? 13 : 14,
              }}
              type="secondary"
            >
              © 2022 Rumah ASN
            </Typography.Text>
            <div>
              <Typography.Text
                style={{
                  fontSize: breakPoint.xs ? 13 : 14,
                }}
                type="secondary"
              >
                BKD Provinsi Jawa Timur
              </Typography.Text>
            </div>
          </div>
        );
      }}
      actionsRender={(props) => {
        return [];
      }}
      appList={appList(data?.user)}
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
          );
        },
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
        defaultOpenAll: false,
      }}
      collapsed={!tutup}
      inlineCollapsed={!tutup}
      defaultCollapsed={!tutup}
      onCollapse={onCollapsed}
      menuItemRender={menuItemRender}
      layout="mix"
      loading={status === "loading"}
      footerRender={() => {
        return (
          <div
            style={{
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            <Typography.Text
              style={{
                fontSize: breakPoint.xs ? 13 : 14,
              }}
              type="secondary"
            >
              Desain dan Pengembangan
            </Typography.Text>
            <div>
              <Typography.Text
                style={{
                  fontSize: breakPoint.xs ? 13 : 14,
                }}
                type="secondary"
              >
                © 2022 BKD Provinsi Jawa Timur | Iput Taufiqurrohman Suwarto,
                S.Kom.
              </Typography.Text>
            </div>
          </div>
        );
      }}
    >
      {children}
    </ProLayout>
  );
}

export default LayoutAsnConnect;

import {
  ApartmentOutlined,
  ApiOutlined,
  BarChartOutlined,
  BookOutlined,
  FileOutlined,
  HomeOutlined,
  LogoutOutlined,
  ReconciliationOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Dropdown } from "antd";
import { uniqBy } from "lodash";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { userRoutes } from "../routes";
import Notifications from "./Notifications";

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

    const pegawaiPemda = user?.group === "MASTER" || user?.group === "PTTPK";
    const pegawaiBKD = bkd || pttBkd;

    // persiapan ini seharusnya ditambahkan halaman dashboard seperti analisis dsb tapi jangan data

    if (pegawaiBKD) {
      userRoutes.routes.push(
        {
          path: "/beranda-bkd",
          name: "Beranda BKD",
          icon: <HomeOutlined />,
        }
        // {
        //   path: "/documents",
        //   name: "Dokumen TTE",
        //   icon: <FileOutlined />,
        //   routes: [
        //     {
        //       path: "/documents/all",
        //       name: "Semua Dokumen",
        //     },
        //     {
        //       path: "/documents/waiting",
        //       name: "Dokumen Menunggu TTE",
        //     },
        //     {
        //       path: "/documents/signed",
        //       name: "Dokumen Sudah TTE",
        //     },
        //     {
        //       path: "/documents/rejected",
        //       name: "Dokumen Ditolak",
        //     },
        //   ],
        // }
      );
    }

    if (pegawaiPemda) {
    }

    if (userPns) {
      userRoutes.routes.push(
        {
          path: "/pemutakhiran-data/data-utama",
          name: "Peremajaan Data",
          icon: <ApiOutlined />,
        },
        {
          path: "/layanan-tracking",
          name: "Layanan Tracking",
          icon: <ReconciliationOutlined />,
          routes: [
            {
              path: "/layanan-tracking/siasn",
              name: "Aplikasi SIASN",
              icon: <UserOutlined />,
            },
            {
              path: "/layanan-tracking/simaster",
              name: "Aplikasi SIMASTER",
              icon: <UserOutlined />,
            },
          ],
        }
      );
    }

    if (admin) {
      userRoutes.routes.push(
        {
          path: "/analysis",
          name: "Analisis",
          icon: <BarChartOutlined />,
          routes: [
            {
              path: "/analysis/dashboard",
              name: "Dashboard",
            },
            {
              path: "/analysis/kecepatan-respon",
              name: "Kecepatan Respon",
            },
            {
              path: "/analysis/kepuasan-pelanggan",
              name: "Kepuasan Pelanggan",
            },
            {
              path: "/analysis/performa-pegawai",
              name: "Performa Pegawai",
            },
            {
              path: "/analysis/trend",
              name: "Trend",
            },
          ],
        },
        {
          path: "/referensi",
          name: "Referensi",
          icon: <BookOutlined />,
          routes: [
            { path: "/referensi/status", name: "Status" },
            {
              path: "/referensi/priorities",
              name: "Prioritas",
            },
            {
              path: "/referensi/categories",
              name: "Kategori",
            },
            {
              path: "/referensi/sub-categories",
              name: "Sub Kategori",
            },
            {
              path: "/referensi/faq",
              name: "F.A.Q",
            },
            {
              path: "/referensi/sub-faq",
              name: "Kategori F.A.Q",
            },
          ],
        },
        {
          path: "/apps-managements",
          name: "Manajemen Aplikasi",
          icon: <ApartmentOutlined />,
          routes: [
            {
              path: "/apps-managements/integrasi",
              name: "Integrasi Aplikasi",
              routes: [
                { path: "/apps-managements/integrasi/siasn", name: "SIASN" },
              ],
            },
            { path: "/apps-managements/users", name: "Pengguna" },
            { path: "/apps-managements/webinars", name: "Webinar" },
            { path: "/apps-managements/podcasts", name: "Podcast" },
            { path: "/apps-managements/announcements", name: "Pengumuman" },
            { path: "/apps-managements/votes", name: "Voting" },
            // {
            //   path: "/apps-managements/executives-signatures",
            //   name: "Set Pejabat TTE",
            // },
          ],
        }
      );
    }

    if (agent) {
      // userRoutes.routes.push({
      //   path: "/documents",
      //   name: "Agent",
      //   icon: <ApiOutlined />,
      // });
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

function Layout({ children, active, collapsed = false }) {
  const { data, status } = useSession();
  const router = useRouter();
  const [tutup, setTutup] = useState(collapsed);

  const onCollapsed = () => {
    setTutup(!tutup);
  };

  return (
    <ProLayout
      theme="light"
      selectedKeys={[active ? active : router.pathname]}
      title="Rumah ASN"
      logo={"https://siasn.bkd.jatimprov.go.id:9000/public/logobkd.jpg"}
      headerTitleRender={(logo, title) => {
        return (
          <>
            <Link href="/feeds">
              <a>{logo}</a>
            </Link>
            {title}
          </>
        );
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
            <div>© 2022 Rumah ASN</div>
            <div>oleh BKD Provinsi Jawa Timur</div>
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
                  if (e.key === "profile") {
                    router.push("/settings/profile");
                  }
                },
                items: [
                  {
                    key: "setting",
                    icon: <SettingOutlined />,
                    label: "Pengaturan",
                  },
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
      collapsed={tutup}
      onCollapse={onCollapsed}
      menuItemRender={menuItemRender}
      layout="mix"
      loading={status === "loading"}
    >
      {children}
    </ProLayout>
  );
}

export default Layout;

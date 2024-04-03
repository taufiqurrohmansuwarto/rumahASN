import { currentUserRole } from "@/services/current-user.services";
import { appList } from "@/utils/app-lists";
import {
  AntDesignOutlined,
  ApiOutlined,
  BarChartOutlined,
  BookOutlined,
  FileSearchOutlined,
  GroupOutlined,
  LogoutOutlined,
  ProfileOutlined,
  QuestionCircleFilled,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Center } from "@mantine/core";
import { AccessControl } from "accesscontrol";
import { Button, Dropdown, Grid, Typography } from "antd";
import { uniqBy } from "lodash";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { userRoutes } from "../routes";
import Messages from "./Messages";
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
    const userPns = user?.group === "MASTER" && user?.role === "USER";
    const userPttpk = user?.group === "PTTPK" && user?.role === "USER";
    const prakom = user?.id === "master|56543";

    const fasilitatorMaster =
      user?.group === "MASTER" && user?.role === "FASILITATOR";

    const pegawaiPemda = userPns || userPttpk;
    const pegawaiBKD = bkd || pttBkd;

    const grantList = user?.app_role?.roles;
    const currentRoleName = user?.app_role?.role;

    const ac = new AccessControl(grantList);
    const sealAdmin = ac.can(currentRoleName).updateAny("seal");
    const canDownload = ac.can(currentRoleName).readAny("download");

    const adminFasilitator = admin || fasilitatorMaster;

    // persiapan ini seharusnya ditambahkan halaman dashboard seperti analisis dsb tapi jangan data
    if (pegawaiPemda) {
      userRoutes.routes.push({
        path: "/asn-connect/asn-updates",
        name: "ASN Connect",
        icon: <UserOutlined />,
      });
    }

    if (adminFasilitator) {
      // userRoutes.routes.push({
      //   path: "/siasn",
      //   name: "Layanan SIASN",
      //   icon: <StarOutlined />,
      //   routes: [
      //     {
      //       path: "/siasn/kenaikan-pangkat",
      //       name: "Kenaikan Pangkat",
      //     },
      //     {
      //       path: "/siasn/pemberhentian",
      //       name: "Pemberhentian",
      //     },
      //   ],
      // });
    }

    if (pegawaiBKD) {
      userRoutes.routes.push(
        {
          path: "/beranda-bkd?tab=my-task",
          name: "Beranda BKD",
          icon: <TeamOutlined />,
        },
        {
          path: "/coaching-clinic-consultant",
          name: "Instruktur",
          icon: <UsergroupAddOutlined />,
        }
      );
    }

    if (fasilitatorMaster) {
      userRoutes.routes.push({
        path: "/fasilitator-employees",
        name: "Layanan Fasilitator",
        icon: <AntDesignOutlined />,
        routes: [
          {
            path: "/fasilitator-employees/master-data",
            name: "Master Data",
          },
          {
            path: "/fasilitator-employees/peta-jabatan",
            name: "Peta Jabatan SIASN",
          },
        ],
      });
    }

    if (userPns) {
      userRoutes.routes.push(
        {
          path: "/pemutakhiran-data/komparasi",
          name: "Integrasi SIASN",
          icon: <ApiOutlined />,
        },
        {
          path: "/submissions/all",
          name: "Usulan",
          icon: <FileSearchOutlined />,
        },
        {
          path: "/berkas",
          name: "Berkas",
          icon: <BookOutlined />,
          routes: [
            {
              path: "/berkas/sk-pns",
              name: "SK PNS",
            },
            {
              path: "/berkas/sk-pppk",
              name: "SK PPPK",
            },
          ],
        }

        // {
        //   path: "/tte",
        //   name: "Tanda Tangan Digital",
        //   icon: <BookOutlined />,
        //   routes: [
        //     {
        //       path: "/tte/certificates",
        //       name: "Sertifikat",
        //     },
        //     {
        //       path: "/tte/documents",
        //       name: "Dokumen",
        //     },
        //     {
        //       path: "/tte/sk",
        //       name: "Surat Keputusan",
        //     },
        //   ],
        // }
      );
    }

    if (admin) {
      userRoutes.routes.push(
        {
          path: "/analysis",
          name: "Analisis",
          icon: <BarChartOutlined />,
          routes: [
            canDownload?.granted && {
              path: "/analysis/download",
              name: "Download Data",
              routes: [
                {
                  path: "/analysis/download/ip-asn",
                  name: "IP ASN",
                },
              ],
            },
            {
              path: "/analysis/report",
              name: "Report",
              routes: [
                {
                  path: "/analysis/report/employees",
                  name: "Report Pegawai",
                },
                {
                  path: "/analysis/report/ip-asn",
                  name: "Report IP ASN",
                },
              ],
            },
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
          icon: <SolutionOutlined />,
          routes: [
            {
              path: "/apps-managements/integrasi",
              name: "Integrasi Aplikasi",
              routes: [
                { path: "/apps-managements/integrasi/siasn", name: "SIASN" },
              ],
            },
            {
              path: "/apps-managements/submissions",
              name: "Usulan",
              routes: [
                {
                  path: "/apps-managements/submissions/references",
                  name: "Kamus Usulan",
                },
                {
                  path: "/apps-managements/submissions/files",
                  name: "File Usulan",
                },
              ],
            },
            sealAdmin?.granted && {
              path: "/apps-managements/esign",
              name: "E-Sign",
              routes: [
                {
                  path: "/apps-managements/esign/seal",
                  name: "Segel Elektronik",
                },
              ],
            },
            {
              path: "/apps-managements/netralitas-asn",
              name: "Netralitas ASN",
            },
            {
              path: "/apps-managements/layanan-kepegawaian",
              name: "Layanan Kepegawaian",
            },
            {
              path: "/apps-managements/anomali-data-2023",
              name: "Data Anomali 2023",
            },
            { path: "/apps-managements/votes", name: "Poling" },
            {
              path: "/apps-managements/webinar-series",
              name: "Webinar Series",
            },
            { path: "/apps-managements/users", name: "Pengguna" },

            { path: "/apps-managements/podcasts", name: "Podcast" },
            { path: "/apps-managements/announcements", name: "Pengumuman" },
            { path: "/apps-managements/discussions", name: "Diskusi" },
          ],
        },
        {
          path: "/logs",
          name: "Riwayat Log",
          icon: <ProfileOutlined />,
          routes: [
            {
              path: "/logs/siasn",
              name: "Riwayat Log SIASN",
            },
            {
              path: "/logs/bsre",
              name: "Riwayat Log BSrE",
            },
          ],
        }
      );
    }

    if (prakom) {
      userRoutes.routes.push({
        path: "/management-users",
        name: "Manajemen Pengguna",
        icon: <GroupOutlined />,
      });
    }

    if (agent) {
      // userRoutes.routes.push({
      //   path: "/documents",
      //   name: "Agent",
      //   icon: <ApiOutlined />,
      // });
    }

    // buat routes di pegawai pemda menjadi paling atas
    // Ensure all routes are unique to avoid duplicates
    const routes = uniqBy(userRoutes.routes, "path");

    // Filter out the routes related to "pegawai pemda" specifically
    const pegawaiPemdaRoutes = routes.filter((route) =>
      route.path.includes("/asn-connect")
    );

    // Filter out the remaining routes that are not related to "pegawai pemda"
    const otherRoutes = routes.filter(
      (route) => !route.path.includes("/asn-connect")
    );

    // Combine the "pegawai pemda" routes to be at the top, followed by other routes
    const sortedRoutes = [...pegawaiPemdaRoutes, ...otherRoutes];

    resolve(sortedRoutes);
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

function Layout({ children, active, collapsed = true }) {
  const { data, status } = useSession();
  const router = useRouter();
  const [tutup, setTutup] = useState(collapsed);

  const breakPoint = Grid.useBreakpoint();

  const handlePertanyan = () => {
    router.push(`/tickets/create`);
  };

  const onCollapsed = () => {
    setTutup(!tutup);
  };

  return (
    <ProLayout
      theme="light"
      selectedKeys={[active ? active : router.pathname]}
      menuExtraRender={({ collapsed }) => {
        if (!collapsed) {
          return (
            <Button
              onClick={handlePertanyan}
              shape="round"
              icon={<QuestionCircleFilled />}
              block
              type="primary"
            >
              Tanya BKD
            </Button>
          );
        } else {
          return (
            <Center>
              <Button
                onClick={handlePertanyan}
                shape="circle"
                size="middle"
                icon={<QuestionCircleFilled />}
                type="primary"
              />
            </Center>
          );
        }
      }}
      title="Rumah ASN"
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
                fontSize: breakPoint.xs ? 12 : 14,
              }}
              type="secondary"
            >
              © 2022 Rumah ASN
            </Typography.Text>
            <div>
              <Typography.Text
                style={{
                  fontSize: breakPoint.xs ? 12 : 14,
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
        // if (props.isMobile) return [];
        return [
          // <SearchUserLayout key="search" />,
          <Messages key="messages" />,
          <Notifications props={props} key="Notifications" />,
        ];
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
            const userRole = await currentUserRole();
            const payload = {
              ...data?.user,
              app_role: userRole,
            };
            const user = await changeRoutes(payload);
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
                © 2022 BKD Provinsi Jawa Timur | Iput Taufiqurrohman Suwarto
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

export default Layout;

import { currentUserRole } from "@/services/current-user.services";
import {
  AntDesignOutlined,
  ApiOutlined,
  BarChartOutlined,
  BookOutlined,
  GroupOutlined,
  LogoutOutlined,
  ProfileOutlined,
  QuestionCircleFilled,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Center } from "@mantine/core";
import {
  IconMessageUser,
  IconUsersGroup,
  IconUserStar,
} from "@tabler/icons-react";
import { AccessControl } from "accesscontrol";
import { Button, Dropdown, Grid, Space, Typography } from "antd";
import { uniqBy } from "lodash";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { userRoutes } from "../routes";
import MegaMenu from "@/components/MegaMenu/MegaMenu";
import NotifikasiASNConnect from "./Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "./Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "./Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "./Notification/NotifikasiPrivateMessage";

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
    if (pegawaiPemda || fasilitatorMaster) {
      userRoutes.routes.push({
        path: "/asn-connect/asn-updates",
        name: "Smart ASN Connect",
        icon: <IconMessageUser size={18} />,
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

    if (pegawaiBKD || fasilitatorMaster) {
      userRoutes.routes.push({
        path: "/coaching-clinic-consultant",
        name: "Coaching & Mentoring",
        icon: <IconUsersGroup size={18} />,
      });
    }

    if (pegawaiBKD) {
      userRoutes.routes.push({
        path: "/beranda-bkd?tab=my-task",
        name: "Beranda BKD",
        icon: <IconUserStar size={18} />,
      });
    }

    if (fasilitatorMaster) {
      userRoutes.routes.push(
        {
          path: "/fasilitator-employees",
          name: "Layanan Fasilitator",
          icon: <AntDesignOutlined />,
          routes: [
            {
              path: "/fasilitator-employees/master-data",
              name: "Master Data",
            },
            {
              path: "/fasilitator-employees/disparitas-unor",
              name: "Disparitas Unor",
            },
            {
              path: "/fasilitator-employees/peta-jabatan",
              name: "Peta Jabatan SIASN",
            },
            {
              path: "/fasilitator-employees/daftar-usulan-kenaikan-pangkat",
              name: "Daftar Usulan KP",
            },
            {
              path: "/fasilitator-employees/perencanaan",
              name: "Perencanaan",
              routes: [
                {
                  path: "/fasilitator-employees/perencanaan/usulan-formasi",
                  name: "Usulan Formasi",
                },
              ],
            },
            // {
            //   path: "/fasilitator-employees/dashboard-rekap",
            //   name: "Dashboard Rekap",
            // },
          ],
        }
        // {
        //   path: "/fasilitator/smart-asn-connect",
        //   name: "Smart ASN Connect",
        //   icon: <IconMessageUser size={18} />,
        //   routes: [
        //     {
        //       path: "/fasilitator/smart-asn-connect/events",
        //       name: "Kegiatan",
        //     },
        //   ],
        // }
      );
    }

    if (userPns) {
      userRoutes.routes.push(
        {
          path: "/pemutakhiran-data/komparasi",
          name: "Integrasi MyASN",
          icon: <ApiOutlined />,
        },
        // {
        //   path: "/submissions/all",
        //   name: "Usulan",
        //   icon: <FileSearchOutlined />,
        // },
        {
          path: "/berkas",
          name: "Berkas",
          icon: <BookOutlined />,
          routes: [
            {
              path: "/berkas/dokumen-administrasi",
              name: "Dokumen Administrasi",
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
              path: "/apps-managements/siasn-services",
              name: "Layanan SIASN",
              routes: [
                {
                  path: "/apps-managements/siasn-services/pengadaan",
                  name: "Pengadaan",
                },
                {
                  path: "/apps-managements/siasn-services/pemberhentian",
                  name: "Pemberhentian",
                },
                {
                  path: "/apps-managements/siasn-services/kenaikan-pangkat/sync",
                  name: "Kenaikan Pangkat",
                },
                {
                  path: "/apps-managements/siasn-services/disparitas-unor",
                  name: "Disparitas Unor",
                },
              ],
            },
            {
              path: "/apps-managements/sync/data",
              name: "Sinkron Data",
            },
            {
              path: "/apps-managements/perencanaan",
              name: "Perencanaan",
              routes: [
                {
                  path: "/apps-managements/perencanaan/usulan",
                  name: "Usulan Formasi",
                },
              ],
            },
            {
              path: "/apps-managements/integrasi",
              name: "Integrasi Aplikasi",
              routes: [
                { path: "/apps-managements/integrasi/siasn", name: "SIASN" },
              ],
            },
            // {
            //   path: "/apps-managements/submissions",
            //   name: "Usulan",
            //   routes: [
            //     {
            //       path: "/apps-managements/submissions/references",
            //       name: "Kamus Usulan",
            //     },
            //     {
            //       path: "/apps-managements/submissions/files",
            //       name: "File Usulan",
            //     },
            //   ],
            // },
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
            // {
            //   path: "/apps-managements/netralitas-asn",
            //   name: "Netralitas ASN",
            // },
            // {
            //   path: "/apps-managements/layanan-kepegawaian",
            //   name: "Layanan Kepegawaian",
            // },
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
            {
              path: "/apps-managements/standar-pelayanan",
              name: "Standar Pelayanan",
            },
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
  return <Link href={`${options.path}`}>{element}</Link>;
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
    <div>
      <ProLayout
        contentStyle={{
          padding: breakPoint.xs ? 0 : null,
          // margin: breakPoint.xs ? 0 : null,
        }}
        theme="light"
        token={{
          bgLayout: "#fafafa",
          colorPrimary: "#16", // Warna oranye utama Ant Design
          sider: {
            colorBgCollapsedButton: "#FA8C16", // Oranye untuk tombol collapse
            colorBgMenuItemActive: "#fafafa", // Oranye sangat muda untuk item menu yang aktif
            colorTextCollapsedButton: "#fafafa", // Putih untuk teks tombol collapse
            colorTextCollapsedButtonHover: "#fafafa", // Oranye sangat muda untuk teks tombol collapse saat di-hover
            colorTextMenuTitle: "#FA8C16", // Oranye untuk judul menu
            colorTextMenuItemHover: "#FA8C16", // Oranye untuk teks menu saat di-hover
            colorTextMenuSelected: "#FA8C16", // Oranye untuk teks menu saat dipilih
            colorTextMenuActive: "#FA8C16", // Oranye untuk teks menu saat aktif
            colorBgMenuItemHover: "rgba(250, 140, 22, 0.1)", // Transparan oranye saat item menu di-hover
            colorBgMenuItemSelected: "rgba(250, 140, 22, 0.2)", // Transparan oranye lebih terang untuk item menu yang dipilih
            colorBgMenuItemCollapsedElevated: "#fafafa", // Putih untuk menu yang tertutup namun ditinggikan
            colorTextMenu: "#595959", // Abu-abu gelap untuk teks menu biasa
            colorBgMenu: "#fafafa", // Putih untuk latar belakang menu
            colorTextMenuSecondary: "#8C8C8C", // Abu-abu medium untuk teks menu sekunder
            colorMenuItemDivider: "#F0F0F0", // Abu-abu sangat muda untuk pembatas menu
          },
        }}
        selectedKeys={[active ? active : router.pathname]}
        menuExtraRender={({ collapsed, isMobile }) => {
          if (!collapsed) {
            if (isMobile)
              return (
                <Button
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 8,
                    marginTop: 8,
                  }}
                  onClick={handlePertanyan}
                  size="middle"
                  shape="round"
                  type="primary"
                  icon={<QuestionCircleFilled />}
                >
                  Tanya BKD
                </Button>
              );
            else {
              return (
                <Center>
                  <Button
                    style={{
                      marginBottom: 10,
                      display: "flex",
                      justifyContent: "center",
                    }}
                    onClick={handlePertanyan}
                    shape="round"
                    icon={<QuestionCircleFilled />}
                    block
                    type="primary"
                  >
                    Tanya BKD
                  </Button>
                </Center>
              );
            }
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
        logo={null}
        headerTitleRender={(logo, title) => {
          const defaultDom = (
            <>
              <Link href="/feeds">{title}</Link>
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
            <NotifikasiKepegawaian
              key="kepegawaian"
              url="kepegawaian"
              title="Inbox Kepegawaian"
            />,
            <NotifikasiPrivateMessage
              key="private-message"
              url="/mails/inbox"
              title="Inbox Pesan Pribadi"
            />,
            <NotifikasiASNConnect
              key="asn-connect"
              url="asn-connect"
              title="Inbox ASN Connect"
            />,
            <NotifikasiForumKepegawaian
              key="forum-kepegawaian"
              url="forum-kepegawaian"
              title="Inbox Forum Kepegawaian"
            />,
            <MegaMenu key="mega-menu" />,
          ];
        }}
        // appList={appList(data?.user)}
        avatarProps={{
          src: data?.user?.image,
          size: "large",
          render: (props, dom) => {
            return (
              <Space>
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
              </Space>
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
                  © 2022 BKD Provinsi Jawa Timur
                </Typography.Text>
              </div>
            </div>
          );
        }}
      >
        {children}
      </ProLayout>
    </div>
  );
}

export default Layout;

import MegaMenuTop from "@/components/MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "@/components/Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "@/components/Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "@/components/Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "@/components/Notification/NotifikasiPrivateMessage";
import { appList } from "@/utils/app-lists";
import { getMenuItems, mappingItems } from "@/utils/appLists";
import {
  BookOutlined,
  LogoutOutlined,
  SunOutlined,
  SyncOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ProConfigProvider } from "@ant-design/pro-components";
import {
  IconBandage,
  IconBuilding,
  IconHistory,
  IconLayoutDashboard,
  IconRotateRectangle,
  IconUserSearch,
} from "@tabler/icons-react";
import { Dropdown, Input, Space } from "antd";
import { trim } from "lodash";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import { rekonToken } from "src/styles/rekon.styles";

const menuItems = [
  {
    key: "/dashboard",
    icon: <IconLayoutDashboard size={16} />,
    label: "Dashboard",
    role: ["admin", "fasilitator"],
  },

  {
    key: "/pegawai",
    icon: <IconUserSearch size={16} />,
    label: "Daftar Pegawai",
    role: ["admin", "fasilitator"],
  },
  {
    key: "/anomali",
    icon: <IconBandage size={16} />,
    label: "Disparitas Data",
    role: ["admin", "fasilitator"],
  },
  {
    key: "/unor",
    icon: <IconBuilding size={16} />,
    label: "Unit Organisasi",
    role: ["admin", "fasilitator"],
  },
  {
    key: "/rekon-ref",
    icon: <IconRotateRectangle size={16} />,
    label: "Rekon Referensi",
    role: ["admin"],
    children: [
      {
        key: "/rekon-ref/rekon-jft",
        icon: <TeamOutlined />,
        label: "Jabatan Fungsional",
        role: ["admin"],
      },
      {
        key: "/rekon-ref/rekon-jfu",
        icon: <SunOutlined />,
        label: "Jabatan Pelaksana",
        role: ["admin"],
      },
      {
        key: "/rekon-ref/rekon-jenjang",
        icon: <BookOutlined />,
        label: "Jenjang",
        role: ["admin"],
      },
      {
        key: "/rekon-ref/rekon-pangkat",
        icon: <BookOutlined />,
        label: "Pangkat",
        role: ["admin"],
      },
      {
        key: "/rekon-ref/rekon-jenis_jabatan",
        icon: <BookOutlined />,
        label: "Jenis Jabatan",
        role: ["admin"],
      },
      {
        key: "/rekon-ref/rekon-eselon",
        icon: <BookOutlined />,
        label: "Eselon",
        role: ["admin"],
      },
      {
        key: "/rekon-ref/rekon-subjabatan",
        icon: <BookOutlined />,
        label: "Sub Jabatan",
        role: ["admin"],
      },
    ],
  },

  // { key: "rekon-diklat", icon: <BookOutlined />, label: "Diklat" },
  {
    key: "/logs",
    icon: <IconHistory size={16} />,
    label: "Logs",
    role: ["admin"],
  },

  {
    key: "update-data",
    icon: <SyncOutlined />,
    label: "Update Data",
    role: ["admin"],
  },
];

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

function RekonLayout({ children, active = "rekon-unor" }) {
  const { data } = useSession();

  const router = useRouter();

  const [collapsed, setCollapsed] = useState(true);

  const handleSearch = (value) => {
    const query = trim(value);
    if (query.length > 0) {
      router.push(`/rekon/pegawai?search=${query}&page=1`);
    } else {
      router.push(`/rekon/pegawai?page=1`);
    }
  };

  return (
    <ProLayout
      title={"Rekon SIASN"}
      defaultCollapsed={collapsed}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      selectedKeys={[active]}
      logo={null}
      layout="mix"
      navTheme="light"
      // fixedHeader
      // fixSiderbar
      token={rekonToken}
      actionsRender={(props) => {
        // if (props.isMobile) return [];
        return [
          <div key="search" style={{ width: "100%", maxWidth: "300px" }}>
            <Input.Search
              onClear={() => handleSearch("")}
              allowClear
              placeholder="Ketik NIP atau Nama..."
              size={props.isMobile ? "small" : "middle"}
              onSearch={handleSearch}
              className="search-input-professional"
              style={{
                width: "100%",
                transition: "all 0.3s ease",
                display: props.collapsed && props.isMobile ? "none" : "block",
              }}
            />
          </div>,
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
          <MegaMenuTop key="mega-menu" url="" title="Menu" />,
        ];
      }}
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
      route={{
        routes: mappingItems(getMenuItems(menuItems, data?.user), "/rekon"),
      }}
      menuItemRender={(item, dom) => (
        <a
          onClick={() => {
            router.push(`${item.key}`);
          }}
        >
          {dom}
        </a>
      )}
      appList={appList(data?.user)}
    >
      {children}
    </ProLayout>
  );
}

export default RekonLayout;

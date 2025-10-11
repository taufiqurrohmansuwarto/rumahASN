import MegaMenuTop from "@/components/MegaMenu/MegaMenuTop";
import { layoutToken } from "@/styles/rasn.theme";
import { appList } from "@/utils/app-lists";
import { getMenuItems, mappingItems } from "@/utils/appLists";
import {
  FilterOutlined,
  LogoutOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  IconClock,
  IconCloudComputing,
  IconFileText,
  IconLayoutDashboard,
  IconSignature,
  IconUser,
} from "@tabler/icons-react";
import { Button, Dropdown, Flex, Input, Space } from "antd";
import { trim } from "lodash";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";

const menuItems = [
  {
    key: "/esign-bkd",
    icon: <IconLayoutDashboard size={16} />,
    label: "Dasbor",
    role: ["admin", "user"],
  },
  {
    key: "/esign-bkd/documents",
    icon: <IconFileText size={16} />,
    label: "Kelola Dokumen",
    role: ["admin", "user"],
  },
  {
    key: "/esign-bkd/signature-requests",
    icon: <IconSignature size={16} />,
    label: "Permintaan Tanda Tangan",
    role: ["admin", "user"],
  },
  {
    key: "/esign-bkd/pending",
    icon: <IconClock size={16} />,
    label: "Menunggu Tindakan",
    role: ["admin", "user"],
  },
  {
    key: "/esign-bkd/bsre",
    icon: <IconCloudComputing size={16} />,
    label: "Monitor BSrE",
    role: ["admin"],
  },
  {
    key: "/esign-bkd/profile",
    icon: <IconUser size={16} />,
    label: "Profil",
    role: ["admin", "user"],
  },
];

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

function EsignBKDLayout({ children, active = "/" }) {
  const { data } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value) => {
    const query = trim(value);
    if (query.length > 0) {
      router.push(
        `/esign-bkd/documents?search=${encodeURIComponent(query)}&page=1`
      );
    } else {
      router.push(`/esign-bkd/documents?page=1`);
    }
  };

  const handleQuickFilter = (filter) => {
    switch (filter) {
      case "dashboard":
        router.push("/esign-bkd");
        break;
      case "pending":
        router.push("/esign-bkd/pending");
        break;
      case "delegated":
        router.push("/esign-bkd/delegated");
        break;
      case "documents":
        router.push("/esign-bkd/documents");
        break;
      default:
        break;
    }
  };

  return (
    <ProLayout
      title={"E-Sign BKD"}
      defaultCollapsed={collapsed}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      selectedKeys={[active]}
      logo={null}
      layout="mix"
      token={layoutToken}
      actionsRender={(props) => {
        return [
          <Flex
            key="search"
            gap="small"
            style={{ maxWidth: "400px", width: "100%" }}
          >
            <Input.Search
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => {
                setSearchValue("");
                handleSearch("");
              }}
              allowClear
              placeholder="Cari dokumen, judul, atau deskripsi..."
              size={props.isMobile ? "small" : "middle"}
              onSearch={handleSearch}
              prefix={<SearchOutlined style={{ color: "#1890ff" }} />}
              style={{
                flex: 1,
                borderRadius: 8,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                display: props.collapsed && props.isMobile ? "none" : "block",
              }}
            />
            <Dropdown
              menu={{
                items: [
                  {
                    key: "dashboard",
                    label: "Dasbor",
                    icon: <IconLayoutDashboard size={14} />,
                    onClick: () => handleQuickFilter("dashboard"),
                  },
                  {
                    key: "documents",
                    label: "Semua Dokumen",
                    icon: <IconFileText size={14} />,
                    onClick: () => handleQuickFilter("documents"),
                  },
                  {
                    key: "pending",
                    label: "Menunggu Tindakan",
                    icon: <IconClock size={14} />,
                    onClick: () => handleQuickFilter("pending"),
                  },
                ],
              }}
              trigger={["click"]}
            >
              <Button
                icon={<FilterOutlined />}
                size={props.isMobile ? "small" : "middle"}
                style={{
                  borderRadius: 8,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  display: props.collapsed && props.isMobile ? "none" : "flex",
                  alignItems: "center",
                }}
                title="Filter Cepat"
              />
            </Dropdown>
          </Flex>,

          <MegaMenuTop key="mega-menu" url="" title="Menu" />,
        ];
      }}
      avatarProps={{
        src: data?.user?.image,
        size: "large",
        render: (_, dom) => {
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
        routes: mappingItems(getMenuItems(menuItems, data?.user), ""),
      }}
      menuItemRender={(item, dom) => (
        <a
          onClick={() => {
            router.push(item.key);
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

export default EsignBKDLayout;

import {
  SmileOutlined,
  DashboardFilled,
  HomeOutlined,
  FileOutlined,
} from "@ant-design/icons";

export const userRoutes = {
  routes: [
    { path: "/feeds", name: "Beranda", icon: <HomeOutlined /> },
    { path: "/tickets", name: "Tiket", icon: <FileOutlined /> },
    {
      path: "/tickets/create",
      name: "Buat Ticket",
      icon: <SmileOutlined />,
      hideInMenu: true,
    },
  ],
};

export const adminRoutes = {
  routes: [
    { path: "/admin/dashboard", name: "Dashboard", icon: <DashboardFilled /> },
    { path: "/admin/status", name: "Status", icon: <DashboardFilled /> },
  ],
};

export const agentRoutes = {
  routes: [
    { path: "/agent/dashboard", name: "Dashboard", icon: <DashboardFilled /> },
    { path: "/agent/status", name: "Status", icon: <DashboardFilled /> },
  ],
};

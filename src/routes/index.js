import { SmileOutlined, HomeOutlined, FileOutlined } from "@ant-design/icons";

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
    { path: "/tickets", name: "test", icon: <SmileOutlined /> },
    { path: "/feeds", name: "test", icon: <SmileOutlined /> },
  ],
};

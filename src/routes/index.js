import {
  BarChartOutlined,
  BookOutlined,
  CarOutlined,
  DashboardFilled,
  HomeOutlined,
  MailOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  SmileOutlined,
  SnippetsOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const userRoutes = {
  routes: [
    { path: "/feeds", name: "Beranda", icon: <HomeOutlined /> },
    {
      path: "/tickets",
      name: "Tiket saya",
      icon: <MailOutlined />,
      routes: [
        {
          path: "/tickets/semua",
          name: "Semua",
        },
        {
          path: "/tickets/diajukan",
          name: "Diajukan",
        },
        {
          path: "/tickets/dikerjakan",
          name: "Dikerjakan",
        },
        {
          path: "/tickets/selesai",
          name: "Selesai",
        },
      ],
    },
    {
      path: "/tickets/create",
      name: "Buat Ticket",
      icon: <SmileOutlined />,
      hideInMenu: true,
    },
    {
      path: "/faq",
      name: "FAQ",
      icon: <QuestionCircleOutlined />,
    },
    {
      path: "/settings",
      name: "Konfigurasi",
      icon: <SettingOutlined />,
      routes: [{ path: "/settings/saved-replies", name: "Balasan Tersimpan" }],
    },
  ],
};

export const pnsLayananRoutes = {
  routes: [
    {
      path: "/layanan",
      name: "Layanan",
      icon: <CarOutlined />,
      routes: [
        { path: "/layanan/siasn", name: "SIASN", icon: <CarOutlined /> },
      ],
    },
  ],
};

export const adminRoutes = {
  routes: [
    { path: "/admin/dashboard", name: "Dashboard", icon: <DashboardFilled /> },
    {
      path: "/admin/analisis",
      name: "Analisis",
      icon: <BarChartOutlined />,
      routes: [
        { path: "/admin/analisis/kecepatan-respon", name: "Kecepatan Respon" },
        {
          path: "/admin/analisis/kepuasan-pelanggan",
          name: "Kepuasan Pelanggan",
        },
        { path: "/admin/analisis/performa-agent", name: "Performa Agent" },
        { path: "/admin/analisis/trend", name: "Trend" },
      ],
    },
    {
      path: "/admin/users-management",
      name: "User Management",
      icon: <UserOutlined />,
    },
    {
      path: "/admin/tickets",
      name: "Ticket Management",
      icon: <BookOutlined />,
      routes: [
        { path: "/admin/tickets-managements/semua", name: "Semua" },
        { path: "/admin/tickets-managements/diajukan", name: "Diajukan" },
        {
          path: "/admin/tickets-managements/dikerjakan",
          name: "Dikerjakan",
        },
        { path: "/admin/tickets-managements/selesai", name: "Selesai" },
      ],
    },
    {
      path: "/admin/apps-management",
      name: "App Management",
      icon: <CarOutlined />,
    },
    {
      path: "/admin/ref",
      name: "Referensi",
      icon: <BookOutlined />,
      routes: [
        {
          path: "/admin/ref/status",
          name: "Status",
        },
        {
          path: "/admin/ref/priorities",
          name: "Prioritas",
        },
        {
          path: "/admin/ref/categories",
          name: "Kategori",
        },
        {
          path: "/admin/ref/sub-categories",
          name: "Sub Kategori",
        },
        {
          path: "/admin/ref/faq",
          name: "FAQ",
        },
        {
          path: "/admin/ref/sub-faq",
          name: "Sub FAQ",
        },
      ],
    },
  ],
};

export const agentRoutes = {
  routes: [
    { path: "/agent/dashboard", name: "Dashboard", icon: <DashboardFilled /> },
    {
      path: "/agent/tickets",
      name: "Tickets",
      icon: <SnippetsOutlined />,
      routes: [
        { path: "/agent/tickets/semua", name: "Semua" },
        { path: "/agent/tickets/diajukan", name: "Diajukan" },
        { path: "/agent/tickets/dikerjakan", name: "Dikerjakan" },
        { path: "/agent/tickets/selesai", name: "Selesai" },
      ],
    },
    {
      path: "/agent/settings",
      name: "Settings",
      icon: <SettingOutlined />,
      routes: [
        { path: "/agent/settings/profile", name: "Profile" },
        { path: "/agent/settings/saved-replies", name: "Saved Replies" },
      ],
    },
  ],
};

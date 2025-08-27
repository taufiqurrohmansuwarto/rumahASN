import {
  IconAi,
  IconBook2,
  IconCalendarUser,
  IconHome,
  IconMailbox,
  IconRobot,
  IconTransfer,
} from "@tabler/icons-react";

export const appLists = [
  {
    rightIcon: <IconHome />,
    title: "Beranda",
    desc: "Beranda",
    color: "#1A73E8",
    url: "/",
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/icon-beranda.png",
    userType: ["asn", "non_asn", "umum", "fasilitator"],
    target: "_blank",
  },
  {
    rightIcon: <IconTransfer />,
    title: "Layanan Keuangan",
    desc: "Layanan Keuangan",
    color: "#FBBC05",
    url: "/layanan-keuangan/dashboard",
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/icon-layanan-keuangan.png",
    userType: ["admin", "asn"],
  },
  {
    rightIcon: <IconTransfer />,
    title: "ASNPedia",
    desc: "Manajemen Pengetahuan",
    color: "#FBBC05",
    url: "/knowledge-managements/dashboard",
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/icon-layanan-keuangan.png",
    userType: ["admin"],
  },
  {
    rightIcon: <IconCalendarUser />,
    title: "TemuBKD",
    desc: "Buku Tamu Digital",
    color: "#4285F4",
    url: "/guests-books/my-visit/visits",
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/icon-temu-bkd.png",
    userType: ["asn", "umum", "non_asn"],
    target: "_blank",
  },

  {
    rightIcon: <IconRobot />,
    title: "Bestie AI",
    desc: "AI Chatbot",
    color: "#1A73E8",
    url: "/chat-ai",
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/icon-bestie.png",
    userType: ["asn"],
    target: "_blank",
  },

  {
    rightIcon: <IconRobot />,
    title: "Usulan",
    desc: "Usulan",
    color: "#1A73E8",
    url: "/usulan",
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/icon-usulan.png",
    userType: ["fasilitator", "admin"],
  },
  {
    rightIcon: <IconBook2 />,
    title: "Dokumen",
    desc: "Dokumen Digital",
    color: "#FBBC05",
    url: "/documents/dashboard",
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/icon-dokumen.png",
    userType: ["asn"],

    target: "_blank",
  },

  {
    rightIcon: <IconMailbox />,
    title: "Persuratan",
    desc: "Persuratan Digital",
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/icon-persuratan.png",
    color: "#FBBC05",
    url: "/letter-managements/letter-header",
    userType: ["fasilitator", "admin"],
    target: "_blank",
  },

  {
    rightIcon: <IconTransfer />,
    title: "Rekon",
    desc: "Mapping Data SIASN & SIMASTER",
    color: "#FBBC05",
    url: "/rekon/dashboard",
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/icon-maping.png",
    userType: ["fasilitator", "admin"],

    target: "_blank",
  },
  {
    rightIcon: <IconTransfer />,
    title: "SIASN",
    desc: "Integrasi Layanan SIASN",
    color: "#FBBC05",
    url: "/layanan-siasn/dashboard",
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/icon-siasn.png",
    userType: ["admin"],
  },
  {
    rightIcon: <IconTransfer />,
    title: "Statistik",
    desc: "Rumah ASN",
    color: "#FBBC05",
    url: "/statistik/dashboard",
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/icon-statistik.png",
    userType: ["admin"],
  },
  {
    rightIcon: <IconTransfer />,
    title: "Logs",
    desc: "Log Rumah ASN",
    color: "#FBBC05",
    url: "/logs/dashboard",
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/icon-log.png",
    userType: ["admin"],
  },
  {
    rightIcon: <IconAi />,
    title: "AI Tools",
    desc: "Tools AI untuk Rumah ASN",
    color: "#FBBC05",
    url: "/ai-tools/dashboard",
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/icon-bestie.png",
    userType: ["admin"],
  },
];

export const getUserType = (user) => {
  if (!user) return [];
  const statusKepegawaian = user?.status_kepegawaian;
  const currentRole = user?.current_role;

  const userTypes = [];
  if (
    statusKepegawaian === "PNS" ||
    statusKepegawaian === "PPPK" ||
    statusKepegawaian === "CPNS"
  ) {
    userTypes.push("asn");
  }
  if (statusKepegawaian === "NONASN") {
    userTypes.push("nonasn");
  }
  if (statusKepegawaian === "FASILITATOR") {
    userTypes.push("fasilitator");
  }
  if (statusKepegawaian === "UMUM") {
    userTypes.push("umum");
  }
  if (currentRole === "admin") {
    userTypes.push("admin");
  }
  if (currentRole === "agent") {
    userTypes.push("agent");
  }

  const filteredApps = appLists?.filter((app) =>
    app?.userType?.some((type) => userTypes.includes(type))
  );

  return {
    userType: userTypes,
    filteredApps,
  };
};

export const getMenuItems = (menuItems, user) => {
  // Cek role user
  const isAdmin =
    (user?.role === "USER" || user?.role === "FASILITATOR") &&
    (user?.group === "MASTER" || user?.group === "NON ASN") &&
    user?.current_role === "admin";

  const asn = user?.group === "MASTER";

  const isFasilitator =
    user?.role === "FASILITATOR" &&
    user?.group === "MASTER" &&
    (user?.current_role === "user" || user?.current_role === "FASILITATOR");

  const isPrakom =
    user?.role === "USER" &&
    user?.group === "MASTER" &&
    user?.id === "master|56543";

  // Fungsi untuk memeriksa apakah item menu sesuai dengan role user
  const checkItemRole = (item) => {
    const { role } = item;

    // Jika user memiliki role prakom dan admin
    if (isPrakom && isAdmin) {
      return role.includes("admin") || role.includes("prakom");
    }

    // Filter berdasarkan single role
    if (isAdmin) return role.includes("admin");
    if (isFasilitator) return role.includes("fasilitator");
    if (isPrakom) return role.includes("prakom");
    if (asn) return role.includes("asn");

    return false;
  };

  // Filter menu berdasarkan role
  const filteredMenuItems = menuItems.filter((item) => {
    // Periksa role pada item menu
    const isRoleMatch = checkItemRole(item);

    // Jika item memiliki children, filter children berdasarkan role juga
    if (item.children && isRoleMatch) {
      item.children = item.children.filter((child) => checkItemRole(child));
      // Jika setelah filtering tidak ada children yang tersisa, kembalikan false
      return item.children.length > 0;
    }

    return isRoleMatch;
  });

  return filteredMenuItems;
};

export const mappingItems = (items, prefix = "") => {
  return items.map((item) => {
    const path = prefix ? `${prefix}${item.key}` : item.key;

    const mappedItem = {
      path: path,
      name: item.label,
      icon: item.icon,
      key: path,
    };

    // Jika item memiliki children, lakukan mapping secara rekursif
    if (item.children && item.children.length > 0) {
      mappedItem.children = mappingItems(item.children, path);
    }

    return mappedItem;
  });
};

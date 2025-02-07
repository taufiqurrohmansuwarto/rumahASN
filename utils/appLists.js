import {
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
    url: "/rekon/rekon-unor",
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/icon-maping.png",
    userType: ["fasilitator", "admin"],

    target: "_blank",
  },
];

export const getUserType = (user) => {
  if (!user) return [];
  const statusKepegawaian = user?.status_kepegawaian;
  const currentRole = user?.current_role;

  const userTypes = [];
  if (statusKepegawaian === "PNS" || statusKepegawaian === "PPPK") {
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

const allAppList = [
  {
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/logo-simaster.png",
    title: "SIMASTER",
    desc: "Sistem Manajemen ASN Terintegrasi",
    url: "https://master.bkd.jatimprov.go.id",
    target: "_blank",
  },
  {
    icon: "https://idis-siasn.bkn.go.id/assets/imgs/logo.svg",
    title: "SIASN",
    desc: "Sistem Informasi Aparatur Sipil Negara",
    url: "https://siasn-instansi.bkn.go.id",
    target: "_blank",
  },
  {
    icon: "https://mysapk.bkn.go.id/assets/images/logogram_login.png",
    title: "MyASN",
    desc: "Sistem Administrasi Kepegawaian",
    url: "https://myasn.bkn.go.id",
    target: "_blank",
  },
];

const apps = [
  {
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/logo-simaster.png",
    title: "PERENCANAAN",
    desc: "Perencanaan ASN",
    url: "",
    target: "_blank",
    role: ["admin", "fasilitator-master"],
  },
];

// pegawai (asn dan non asn) apps
const pegawaiPemprovAppList = [
  {
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/logo-simaster.png",
    title: "ASN Connect",
    desc: "ASN Connect",
    url: "http://localhost:3088/helpdesk/asn-connect/asn-updates",
    target: "_blank",
  },
];

// admin apps

// pegawai pemprov apps

// pttpk apps
const pttpkAppList = [
  {
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/logo-simaster.png",
    title: "PTTPK Penilaian",
    desc: "PTTPK Penilaian",
    url: "https://siasn.bkd.jatimprov.go.id/pttpk-penilaian",
    target: "_blank",
  },
];

const anomali = [
  {
    icon: "https://siasn.bkd.jatimprov.go.id:9000/public/logo-simaster.png",
    title: "Anomali",
    desc: "Anomali",
    url: "https://siasn.bkd.jatimprov.go.id/pttpk-penilaian",
    target: "_blank",
  },
];

// pns apps

// p3k apps

export const appList = (user) => {
  const role = user?.current_role;
  const bkd = user?.organization_id?.startsWith("123");
  const pttBkd = user?.organization_id?.startsWith("134");

  // ada fasilitator simaster, asn, pttpk, non asn
  const admin = (role === "admin" && bkd) || (role === "admin" && pttBkd);
  const agent = (role === "agent" && bkd) || (role === "agent" && pttBkd);
  const userPns = user?.group === "MASTER" && user?.role === "USER";
  const userPttpk = user?.group === "PTTPK" && user?.role === "USER";

  const fasilitatorMaster =
    user?.group === "MASTER" && user?.role === "FASILITATOR";

  const pegawaiPemda = userPns || userPttpk;
  const pegawaiBKD = bkd || pttBkd;

  if (userPttpk) {
    const currentApplist = [...allAppList, ...pttpkAppList];
    return currentApplist;
  } else if (pegawaiPemda) {
    const currentApplist = [...allAppList, ...pegawaiPemprovAppList];
    return currentApplist;
  } else {
    return allAppList;
  }
};

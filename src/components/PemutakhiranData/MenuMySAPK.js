import {
  Card,
  Group,
  SimpleGrid,
  Text,
  UnstyledButton,
  createStyles,
  rem,
} from "@mantine/core";
import {
  Icon123,
  IconArrowsExchange,
  IconBadge,
  IconBadges,
  IconBriefcase,
  IconCashBanknote,
  IconClipboardData,
  IconClock,
  IconFileAnalytics,
  IconFileCertificate,
  IconReport,
  IconSchool,
  IconUserSearch,
  IconUserX,
  IconUsers,
} from "@tabler/icons";
import { Grid } from "antd";
import { useRouter } from "next/router";

const mockdata = [
  {
    title: "Data Utama",
    icon: IconUserSearch,
    color: "violet",
    path: "/data-utama",
  },
  {
    title: "Riwayat Jabatan",
    icon: IconBadge,
    color: "green",
    path: "/jabatan",
  },
  {
    title: "Riwayat Angka Kredit",
    icon: Icon123,
    color: "green",
    path: "/angka-kredit",
  },
  {
    title: "Riwayat Laporan Kinerja 22",
    icon: IconCashBanknote,
    color: "yellow",
    path: "/laporan-kinerja",
  },
  {
    title: "Riwayat Golongan/Pangkat",
    icon: IconBadges,
    color: "indigo",
    path: "/golongan",
  },
  {
    title: "Riwayat Pendidikan",
    icon: IconSchool,
    color: "blue",
    path: "/pendidikan",
  },

  {
    title: "Riwayat Peninjauan Masa Kerja",
    icon: IconClock,
    color: "teal",
    path: "/pmk",
  },
  {
    title: "Riwayat CPNS/PNS",
    icon: IconUserX,
    color: "cyan",
    path: "/cpnspns",
  },
  {
    title: "Riwayat Diklat/Kursus",
    icon: IconReport,
    color: "pink",
    path: "/diklat",
  },
  {
    title: "Riwayat Keluarga",
    icon: IconUsers,
    color: "red",
    path: "/keluarga",
  },
  {
    title: "Riwayat SKP",
    icon: IconClipboardData,
    color: "orange",
    path: "/skp",
  },
  {
    title: "Riwayat Penghargaan",
    icon: IconFileCertificate,
    color: "orange",
    path: "/penghargaan",
  },
  {
    title: "Riwayat Organisasi",
    icon: IconFileAnalytics,
    color: "pink",
    path: "/organisasi",
  },
  { title: "Riwayat CLTN", icon: IconBriefcase, color: "green", path: "/cltn" },
  {
    title: "Riwayat Pencamtuman Gelar",
    icon: IconSchool,
    color: "cyan",
    path: "/pencantuman-gelar",
  },
  {
    title: "Riwayat Hukuman Disiplin",
    icon: IconSchool,
    color: "orange",
    path: "/hukuman-disiplin",
  },

  {
    title: "Riwayat Pindah Instansi",
    icon: IconArrowsExchange,
    color: "red",
    path: "/pindah-instansi",
  },
];

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 700,
  },

  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: theme.radius.md,
    height: rem(90),
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease, transform 100ms ease",

    "&:hover": {
      boxShadow: theme.shadows.md,
      transform: "scale(1.05)",
    },
  },
}));

export function MenuMySAPK() {
  const router = useRouter();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const { classes, theme } = useStyles();

  const handleClick = (currentPath) => {
    const path = `/pemutakhiran-data${currentPath}`;
    router.push(path);
  };

  const items = mockdata.map((item) => (
    <UnstyledButton
      onClick={() => handleClick(item?.path)}
      key={item.title}
      className={classes.item}
    >
      <item.icon color={theme.colors[item.color][6]} size="2rem" />
      <Text size="xs" mt={7}>
        {item.title}
      </Text>
    </UnstyledButton>
  ));

  return (
    <Card
      style={{
        width: screens.xs ? "100%" : 800,
      }}
      withBorder
      radius="md"
      className={classes.card}
    >
      <Group position="apart">
        <Text className={classes.title}>Peremajaan Data SIASN-SIMASTER</Text>
      </Group>
      <SimpleGrid
        cols={screens.xl ? 4 : screens.lg ? 3 : screens.md ? 2 : 2}
        mt="md"
      >
        {items}
      </SimpleGrid>
    </Card>
  );
}

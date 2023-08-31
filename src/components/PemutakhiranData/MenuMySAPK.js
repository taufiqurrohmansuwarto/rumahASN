import { mysapkMenu } from "@/utils/client-utils";
import {
  Alert,
  Card,
  Group,
  SimpleGrid,
  Text,
  UnstyledButton,
  createStyles,
  rem,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { Grid } from "antd";
import { useRouter } from "next/router";

const mockdata = mysapkMenu;

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
        width: "100%",
      }}
      withBorder
      radius="md"
      className={classes.card}
    >
      <Alert
        mb={10}
        color="red"
        icon={<IconAlertCircle size="1rem" />}
        title="Perhatian!"
      >
        Bagi Para ASN yang mau melakukan peremajaan data, menu yang bisa
        ditambah adalah Riwayat Jabatan, Riwayat Angka Kredit, dan Laporan
        Kinerja 2022. Terima Kasih
      </Alert>

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

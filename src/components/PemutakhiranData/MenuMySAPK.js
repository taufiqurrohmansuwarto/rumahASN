import IPAsn from "@/components/LayananSIASN/IPAsn";
import AnomaliUser from "@/components/PemutakhiranData/AnomaliUser";
import { mysapkMenu } from "@/utils/client-utils";
import {
  Card,
  Group,
  Image,
  SimpleGrid,
  Text,
  UnstyledButton,
  createStyles,
  rem,
} from "@mantine/core";
import { Avatar, Grid, Space, Tag, Typography } from "antd";
import { useRouter } from "next/router";

const mockdata = mysapkMenu;

const toImage = (base64) => `data:image/jpeg;base64,${base64}`;

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

const Base64Image = ({ data }) => {
  return <Image maw={200} src={`data:image/png;base64,${data}`} alt="base64" />;
};

export function MenuMySAPK({ dataUtama, foto }) {
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
      <Group position="apart" mb={14}>
        <Card w={"100%"}>
          <Space direction="vertical" size="small">
            <Avatar size={50} src={`${foto?.data}`} alt="Foto-SIASN" />
            <Typography.Text strong>{dataUtama?.nama}</Typography.Text>
            <Typography.Text type="secondary">
              NIP {dataUtama?.nipBaru}
            </Typography.Text>
            <Typography.Text type="secondary">
              {dataUtama?.unorIndukNama} - {dataUtama?.unorNama}
            </Typography.Text>
            <Space
              size="small"
              direction={screens.xl ? "horizontal" : "vertical"}
            >
              <IPAsn tahun={2023} />
              <Tag color="yellow">{dataUtama?.kedudukanPnsNama}</Tag>
              <Tag color={dataUtama?.validNik ? "green" : "red"}>
                {dataUtama?.validNik
                  ? "NIK Terverifikasi"
                  : "NIK Belum Terverifikasi"}
              </Tag>
            </Space>
            <AnomaliUser />
          </Space>
        </Card>
      </Group>
      <SimpleGrid
        cols={screens.xl ? 6 : screens.lg ? 3 : screens.md ? 2 : 2}
        mt="md"
      >
        {items}
      </SimpleGrid>
    </Card>
  );
}

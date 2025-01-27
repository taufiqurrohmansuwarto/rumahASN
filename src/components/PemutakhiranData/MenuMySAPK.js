import IPAsn from "@/components/LayananSIASN/IPAsn";
import { mysapkMenu } from "@/utils/client-utils";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  TagOutlined,
} from "@ant-design/icons";
import {
  ActionIcon,
  Card,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
  createStyles,
  rem,
} from "@mantine/core";
import { IconInfoCircleFilled } from "@tabler/icons-react";
import { Avatar, Flex, Grid, Space, Tag, Tooltip, Typography } from "antd";
import { useRouter } from "next/router";
import PengaturanGelar from "../LayananSIASN/PengaturanGelar";
import GantiEmail from "../LayananSIASN/GantiEmail";
import DisparitasData from "../LayananSIASN/DisparitasData";
import { IconAlertTriangle } from "@tabler/icons";

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
          <Stack spacing={8}>
            <Flex justify="space-between">
              <Stack spacing={6} mb={10}>
                <Avatar
                  shape="square"
                  size={60}
                  src={`${foto?.data}`}
                  alt="Foto-SIASN"
                />
                <Typography.Text style={{ margin: 0 }} strong>
                  {dataUtama?.nama}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ margin: 0 }}>
                  {dataUtama?.nipBaru}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ margin: 0 }}>
                  {dataUtama?.jabatanNama}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ margin: 0 }}>
                  {dataUtama?.unorIndukNama} - {dataUtama?.unorNama}
                </Typography.Text>
              </Stack>
              <div>
                <Space>
                  <Tooltip title="Kedudukan PNS">
                    <Tag icon={<TagOutlined />} color="yellow">
                      {dataUtama?.kedudukanPnsNama}
                    </Tag>
                  </Tooltip>
                  <Tooltip title="Status Verifikasi NIK dengan NIP">
                    <Tag
                      icon={
                        dataUtama?.validNik ? (
                          <CheckCircleFilled />
                        ) : (
                          <CloseCircleFilled />
                        )
                      }
                      color={dataUtama?.validNik ? "green" : "red"}
                    >
                      {dataUtama?.validNik
                        ? "NIK Terverifikasi"
                        : "NIK Belum Terverifikasi"}
                    </Tag>
                  </Tooltip>
                  <DisparitasData />
                </Space>
              </div>
            </Flex>
            <Flex gap={2} style={{ marginBottom: 16 }}>
              {/* <IPAsn tahun={2023} /> */}
              <PengaturanGelar />
              <GantiEmail />
            </Flex>
            {/* <AnomaliUser /> */}
          </Stack>
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

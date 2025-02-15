import IPAsn from "@/components/LayananSIASN/IPAsn";
import { mysapkMenu } from "@/utils/client-utils";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  TagOutlined,
} from "@ant-design/icons";
import {
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
import { Avatar, Flex, Grid, Space, Tag, Tooltip, Typography } from "antd";
import { useRouter } from "next/router";
import DisparitasData from "../LayananSIASN/DisparitasData";
import GantiEmail from "../LayananSIASN/GantiEmail";
import PengaturanGelar from "../LayananSIASN/PengaturanGelar";
import { getDisparitas } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";

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

const useDisparitasPersonal = () => {
  const { data, isLoading, refetch, isFetching } = useQuery(
    ["disparitas-personal"],
    () => getDisparitas(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return { disparitas: data, loading: isLoading, refetch, isFetching };
};

export function MenuMySAPK({ dataUtama, foto, simaster }) {
  const router = useRouter();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const { disparitas, loading, refetch, isFetching } = useDisparitasPersonal();

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
                <Space>
                  <Tooltip title="Foto SIMASTER">
                    <Avatar
                      shape="square"
                      size={60}
                      src={`${simaster?.foto}`}
                      alt="Foto-SIMASTER"
                    />
                  </Tooltip>
                  <Tooltip title="Foto SIASN">
                    <Avatar
                      shape="square"
                      size={60}
                      src={`${foto?.data}`}
                      alt="Foto-SIASN"
                    />
                  </Tooltip>
                </Space>
                <Space direction={screens.xl ? "horizontal" : "vertical"}>
                  <Typography.Text style={{ margin: 0 }} strong>
                    {dataUtama?.nama}
                  </Typography.Text>

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
                </Space>

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
                  <DisparitasData
                    data={disparitas}
                    isLoading={loading}
                    refetch={refetch}
                    isFetching={isFetching}
                  />
                </Space>
              </div>
            </Flex>
            <Flex
              vertical={screens.xl ? false : true}
              gap={2}
              style={{ marginBottom: 16 }}
            >
              <IPAsn tahun={2024} />
              <PengaturanGelar />
              <GantiEmail />
            </Flex>
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

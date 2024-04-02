import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Spoiler,
  Stack,
  Text,
} from "@mantine/core";
import { Col, List, Row, Card as AntdCard, Input } from "antd";

import ReactPlayer from "../ReactPlayer";
import { IconAlertCircle } from "@tabler/icons";

const data = [
  {
    id: 1,
    url: "https://www.youtube.com/watch?v=5CwM6WZVs44&t=3s",
    title: "Daftar Hingga Mendapat Sertifikat Webinar Rumah ASN",
    description:
      "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    id: 2,
    url: "https://www.youtube.com/watch?v=b93lpc0Go_4",
    title: "Input Menambahkan Nilai IP ASN",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
  {
    id: 4,
    url: "https://www.youtube.com/watch?v=_MvI-PHyA8I&t=55s",
    title: "Generate Kartu Virtual ASN",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
  {
    id: 3,
    url: "https://www.youtube.com/watch?v=tXCtuXqoWOQ",
    title: "Tutorial Merubah Rumpun Jabatan dan Import Jabatan Kesehatan",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
  {
    id: 4,
    url: "https://www.youtube.com/watch?v=DfCnKu7USwA",
    title:
      "Menambah Rumpun Jabatan, Jenis Unor, Lokasi Unor, dan Info Jabatan Pada Aplikasi SIASN",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
  {
    id: 5,
    url: "https://www.youtube.com/watch?v=lKZB35QKk_4",
    title: "Pemetaan Jabatan di SIMASTER",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
  {
    id: 6,
    url: "https://www.youtube.com/watch?v=JiWXgxJeQdU&t=275s",
    title: "Pindah Jabatan di SIMASTER",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
  {
    id: 7,
    url: "https://youtu.be/cbV1PJz10Ck?si=SXs2ogU5-egLM1pm",
    title: "E-Presensi 2021",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
];

const CustomVideo = ({ url, title, description }) => {
  return (
    <Card shadow="sm" mt="sm" padding="lg" radius="md" withBorder mih={300}>
      <Card.Section>
        <ReactPlayer
          width="auto"
          height={200} // Changed height here
          url={url}
        />
      </Card.Section>

      <Group position="apart" mt="md" mb="xs">
        <Text size="xs">{title}</Text>
      </Group>

      {/* <Spoiler maxHeight={40} showLabel="Show more" hideLabel="Hide">
        <Text size="sm" color="dimmed">
          {description}
        </Text>
      </Spoiler> */}
    </Card>
  );
};

function Tutorials() {
  return (
    <AntdCard>
      <Row>
        <Col md={16}>
          <Stack>
            <Alert icon={<IconAlertCircle />} color="yellow">
              Halaman ini berisi tutorial-tutorial yang dapat membantu Anda
              dalam menggunakan aplikasi Rumah ASN. Pilih tutorial yang ingin
              Anda lihat dan ikuti langkah-langkahnya.
            </Alert>

            <Input.Search placeholder="Cari Tutorial" />
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 4,
                lg: 4,
                xl: 4,
                xxl: 4,
              }}
              pagination={{
                position: "both",
                total: data.length,
                showTotal: (total) => `Total ${total} items`,
              }}
              dataSource={data}
              rowKey={(row) => row?.id}
              renderItem={(item) => (
                <List.Item>
                  <CustomVideo
                    url={item?.url}
                    title={item?.title}
                    description={item?.description}
                  />
                </List.Item>
              )}
            />
          </Stack>
        </Col>
      </Row>
    </AntdCard>
  );
}

export default Tutorials;

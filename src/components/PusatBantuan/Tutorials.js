import { Button, Card, Group, Spoiler, Text } from "@mantine/core";
import { Col, List, Row, Card as AntdCard } from "antd";

import ReactPlayer from "../ReactPlayer";

const data = [
  {
    id: 1,
    url: "https://www.youtube.com/watch?v=5CwM6WZVs44&t=3s",
    title: "Tutorial Daftar Hingga Mendapat Sertifikat Webinar Rumah ASN",
    description:
      "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    id: 2,
    url: "https://www.youtube.com/watch?v=b93lpc0Go_4",
    title: "Tutorial Input Menambahkan Nilai IP ASN",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
  {
    id: 4,
    url: "https://www.youtube.com/watch?v=_MvI-PHyA8I&t=55s",
    title: "Tutorial Generate Kartu Virtual ASN",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
  {
    id: 3,
    url: "https://www.youtube.com/watch?v=tXCtuXqoWOQ",
    title: "Cara membuat kartu virtual ASN",
    description:
      "Yuk Guys mimin kasih tau bagaimana caranya menggenerate kartu virtual mohon disimak ya",
  },
];

const CustomVideo = ({ url, title, description }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <ReactPlayer
          width="auto"
          height={200} // Changed height here
          url={url}
        />
      </Card.Section>

      <Group position="apart" mt="md" mb="xs">
        <Text weight={500}>{title}</Text>
      </Group>

      <Spoiler maxHeight={40} showLabel="Show more" hideLabel="Hide">
        <Text size="sm" color="dimmed">
          {description}
        </Text>
      </Spoiler>
    </Card>
  );
};

function Tutorials() {
  return (
    <AntdCard>
      <Row>
        <Col md={16}>
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
        </Col>
      </Row>
    </AntdCard>
  );
}

export default Tutorials;

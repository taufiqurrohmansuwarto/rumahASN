import { Center, Paper, Text } from "@mantine/core";
import { Col, Image, Row, Space } from "antd";

function CardLayananKepegawaian({ title, image, description, bidang }) {
  return (
    <Paper shadow="xs" radius="sm" p="xl">
      <Row gutter={[16, 16]}>
        <Col md={6} xs={6}>
          <Center>
            <Image alt="image" src={image} />
          </Center>
        </Col>
        <Col md={18} xs={18}>
          <Space direction="vertical">
            <Text fz="xs" c="dimmed">
              {title}
            </Text>
            <Text fz="md">{description}</Text>
            <Text fz="xs" c="dimmed">
              {bidang}
            </Text>
          </Space>
        </Col>
      </Row>
    </Paper>
  );
}

export default CardLayananKepegawaian;

import { Center, Image, Paper, Text } from "@mantine/core";
import { Card, Col, Row, Space } from "antd";
import { startCase, toLower } from "lodash";

function CardLayananKepegawaian({ title, image, bidang, onClick }) {
  return (
    <Card hoverable onClick={onClick}>
      <Row gutter={[16, 16]}>
        <Col md={6} xs={6}>
          <Center>
            <Image
              maw={240}
              mx="auto"
              radius="md"
              src={
                image ||
                "https://siasn.bkd.jatimprov.go.id:9000/public/layanan_cuti_umroh.png"
              }
              alt="Random image"
            />
          </Center>
        </Col>
        <Col md={18} xs={18}>
          <Space direction="vertical">
            <Text fz="xs" c="dimmed">
              Layanan Kepegawaian
            </Text>
            <Text fz="lg">{title}</Text>
            <Text fz="xs" c="dimmed">
              {startCase(toLower(bidang))}
            </Text>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}

export default CardLayananKepegawaian;

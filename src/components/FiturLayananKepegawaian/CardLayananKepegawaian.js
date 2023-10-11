import { Center, Image, Paper, Stack, Text } from "@mantine/core";
import { Col, Row } from "antd";
import { startCase, toLower } from "lodash";

function CardLayananKepegawaian({ title, image, bidang, onClick }) {
  return (
    <Paper
      onClick={onClick}
      shadow="xs"
      radius="sm"
      p={20}
      style={{
        height: 180,
        cursor: "pointer",
      }}
    >
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
          <Stack spacing="lg">
            <Text lineClamp={2} fz="xs" c="dimmed">
              Layanan Kepegawaian
            </Text>
            <Text fz="lg" lineClamp={1}>
              {title}
            </Text>
            <Text fz="xs" c="dimmed">
              {startCase(toLower(bidang))}
            </Text>
          </Stack>
        </Col>
      </Row>
    </Paper>
  );
}

export default CardLayananKepegawaian;

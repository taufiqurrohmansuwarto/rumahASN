import {
  CalendarTwoTone,
  ClockCircleTwoTone,
  FolderTwoTone,
  PushpinTwoTone,
  TagsTwoTone,
} from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { Button, Card, Col, Divider, Image, Row, Typography } from "antd";

function DetailWebinarNew({ data, withDownload = false }) {
  return (
    <Row
      gutter={{
        xs: 16,
        sm: 16,
        md: 16,
        lg: 16,
      }}
    >
      <Col md={16} xs={24}>
        <Card
          cover={<Image preview={false} src={data?.image_url} alt="image" />}
        >
          <Divider />
          <Typography.Title level={4}>{data?.title}</Typography.Title>
          <Typography.Text level={4}>{data?.description}</Typography.Text>
        </Card>
      </Col>
      <Col md={8} xs={24}>
        <Card title="Informasi Event">
          <Stack>
            <div>
              <CalendarTwoTone />{" "}
              <Typography.Text strong>31 Agustus 2023</Typography.Text>
            </div>
            <div>
              <ClockCircleTwoTone />{" "}
              <Typography.Text strong>14:00 s/d 16:00 WIB</Typography.Text>
            </div>
            <div>
              <PushpinTwoTone />{" "}
              <Typography.Text strong>Online</Typography.Text>
            </div>
            <div>
              <TagsTwoTone />{" "}
              <Typography.Text strong>1000 Peserta</Typography.Text>
            </div>
            <div>
              <FolderTwoTone />{" "}
              <Typography.Text strong>Materi & Sertifikat</Typography.Text>
            </div>
          </Stack>
          <Divider />
          <Button block type="primary">
            Registrasi
          </Button>
        </Card>
      </Col>
    </Row>
  );
}

export default DetailWebinarNew;

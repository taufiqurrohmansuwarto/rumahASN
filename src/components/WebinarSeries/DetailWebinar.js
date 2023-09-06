import { formatDateSimple } from "@/utils/client-utils";
import {
  ClockCircleTwoTone,
  DeleteOutlined,
  FolderOpenOutlined,
  PushpinTwoTone,
  TagsTwoTone,
  VideoCameraAddOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { Stack } from "@mantine/core";
import {
  Button,
  Card,
  Col,
  Divider,
  Image,
  Row,
  Space,
  Typography,
  Modal,
} from "antd";

function DetailWebinar({ data }) {
  const handleRemove = () => {
    Modal.confirm({
      title: "Hapus Webinar",
      content:
        "Apakah anda yakin ingin menghapus webinar ini?, data peserta, komentar, dan survey akan ikut terhapus",
      okText: "Ya",
      centered: true,
    });
  };

  return (
    <>
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
            <Typography.Title level={4}>{data?.title}</Typography.Title>
            <Divider />
            <Typography.Text level={4}>{data?.description}</Typography.Text>
          </Card>
        </Col>
        <Col md={8} xs={24}>
          <Card title="Informasi Event">
            <Stack>
              <div>
                <ClockCircleTwoTone />{" "}
                <Typography.Text strong>
                  {formatDateSimple(data?.start_date)} -{" "}
                  {formatDateSimple(data?.end_date)}
                </Typography.Text>
              </div>
              <div>
                <PushpinTwoTone />{" "}
                <Typography.Text strong>Online</Typography.Text>
              </div>
              <div>
                <TagsTwoTone />{" "}
                <Typography.Text strong>
                  {parseInt(data?.participants_count)} Peserta
                </Typography.Text>
              </div>
              <Divider />
              {data?.reference_link && (
                <div>
                  <FolderOpenOutlined />{" "}
                  <Typography.Text strong>
                    <a
                      href={data?.reference_link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Link Materi
                    </a>
                  </Typography.Text>
                </div>
              )}
              {data?.youtube_url && (
                <div>
                  <YoutubeOutlined />{" "}
                  <Typography.Text strong>
                    <a
                      href={data?.youtube_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Link Youtube
                    </a>
                  </Typography.Text>
                </div>
              )}
              {data?.zoom_url && (
                <div>
                  <VideoCameraAddOutlined />{" "}
                  <Typography.Text strong>
                    <a href={data?.zoom_url} target="_blank" rel="noreferrer">
                      Link Zoom
                    </a>
                  </Typography.Text>
                </div>
              )}
            </Stack>
            <Button onClick={handleRemove} danger icon={<DeleteOutlined />}>
              Hapus
            </Button>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default DetailWebinar;

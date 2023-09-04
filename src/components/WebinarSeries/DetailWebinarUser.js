import { formatDateSimple } from "@/utils/client-utils";
import {
  ClockCircleTwoTone,
  FolderOpenOutlined,
  PushpinTwoTone,
  TagsTwoTone,
  VideoCameraAddOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { Button, Card, Col, Divider, Image, Row, Tag, Typography } from "antd";
import { useRouter } from "next/router";

const Tombol = ({
  data,
  alreadyPoll,
  downloadCertificate,
  loadingDownloadCertificate,
}) => {
  const router = useRouter();
  const id = router.query.id;

  if (!data?.is_allow_download_certificate) {
    return null;
  }

  if (data?.is_allow_download_certificate && !alreadyPoll) {
    return (
      <Button
        type="primary"
        block
        onClick={() => router.push(`/webinar-series/my-webinar/${id}/survey`)}
      >
        Isi Kuisioner
      </Button>
    );
  }

  if (data?.is_allow_download_certificate && alreadyPoll) {
    return (
      <Button
        type="primary"
        block
        onClick={downloadCertificate}
        loading={loadingDownloadCertificate}
      >
        Unduh Sertifikat
      </Button>
    );
  }
};

function DetailWebinarNew({
  data,
  downloadCertificate,
  loadingDownloadCertificate,
  alreadyPoll,
}) {
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
            <Divider />
            <Typography.Title level={4}>
              {data?.webinar_series?.title}
            </Typography.Title>
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
              <div>
                <Tag
                  color={data?.is_allow_download_certificate ? "green" : "red"}
                >
                  {data?.is_allow_download_certificate
                    ? "Dapat mengunduh sertifikat"
                    : "Sertifikat Belum bisa diunduh"}
                </Tag>
              </div>
            </Stack>
            <Divider />
            <Tombol
              downloadCertificate={downloadCertificate}
              loadingDownloadCertificate={loadingDownloadCertificate}
              alreadyPoll={alreadyPoll}
              data={data}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default DetailWebinarNew;

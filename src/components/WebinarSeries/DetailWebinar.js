import { removeWebinar, resetCertificates } from "@/services/webinar.services";
import { formatDateWebinar } from "@/utils/client-utils";
import {
  CarryOutTwoTone,
  ClockCircleTwoTone,
  DeleteOutlined,
  EditTwoTone,
  FolderOpenOutlined,
  TagsTwoTone,
  VideoCameraAddOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Divider,
  Modal,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useRouter } from "next/router";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";

const WebinarStatus = ({ data }) => {
  return (
    <Space>
      <Tag color={data?.status === "published" ? "green" : "red"}>
        {data?.status === "published" ? "Publikasi" : "Belum publikasi"}
      </Tag>
      <Tag color={data?.is_allow_download_certificate ? "green" : "red"}>
        {data?.is_allow_download_certificate
          ? "Sertifikat Siap Unduh"
          : "Sertifikat belum siap unduh"}
      </Tag>
      <Tag color={data?.is_open ? "green" : "red"}>
        {data?.is_open ? "Pendaftaran dibuka" : "Pendaftaran ditutup"}
      </Tag>
    </Space>
  );
};

function DetailWebinar({ data }) {
  const router = useRouter();

  const queryClient = useQueryClient();

  const handleEdit = () => {
    router.push(`/apps-managements/webinar-series/${data?.id}/edit`);
  };

  const { mutateAsync: hapus, isLoading: isLoadingHapus } = useMutation(
    (data) => removeWebinar(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus webinar series");
        router.push(`/apps-managements/webinar-series`);
      },
      onError: () => {
        message.error("Gagal menghapus webinar series");
      },
      onSettled: () => {
        queryClient.invalidateQueries([
          "webinar-series-admin-detail",
          router?.query?.id,
        ]);
      },
    }
  );

  const { mutateAsync: reset, isLoading: isLoadingReset } = useMutation(
    (data) => resetCertificates(data),
    {
      onSuccess: () => {
        message.success("Berhasil mereset sertifikat");
        queryClient.invalidateQueries([
          "webinar-user-detail",
          router?.query?.id,
        ]);
      },
      onError: () => {
        message.error("Gagal mereset sertifikat");
      },
      onSettled: () => {
        queryClient.invalidateQueries([
          "webinar-series-admin-detail",
          router?.query?.id,
        ]);
      },
    }
  );

  const handleRemove = () => {
    Modal.confirm({
      title: "Hapus Webinar",
      content:
        "Apakah anda yakin ingin menghapus webinar ini?, data peserta, komentar, dan survey akan ikut terhapus",
      okText: "Ya",
      centered: true,
      onOk: async () => await hapus(router?.query?.id),
    });
  };

  const handleReset = () => {
    Modal.confirm({
      title: "Reset Sertifikat",
      content:
        "Apakah anda yakin ingin mereset sertifikat webinar ini?, data sertifikat yang sudah diunduh akan hilang",
      okText: "Ya",
      centered: true,
      onOk: async () => await reset(router?.query?.id),
    });
  };

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col md={16} xs={24}>
          <Card>
            <Typography.Title level={4}>{data?.title}</Typography.Title>
            <Divider />
            <Stack>
              <WebinarStatus data={data} />
              <ReactMarkdownCustom>{data?.description}</ReactMarkdownCustom>
            </Stack>
          </Card>
        </Col>
        <Col md={8} xs={24}>
          <Card
            title={
              <Space>
                <Typography.Text>Informasi Event</Typography.Text>
                <Tooltip title="Edit Webinar">
                  <EditTwoTone onClick={handleEdit} />
                </Tooltip>
              </Space>
            }
          >
            <Stack>
              <div>
                <ClockCircleTwoTone />{" "}
                <Typography.Text strong>
                  {formatDateWebinar(data?.start_date)} -{" "}
                  {formatDateWebinar(data?.end_date)}
                </Typography.Text>
              </div>
              <div>
                <TagsTwoTone />{" "}
                <Typography.Text strong>
                  {parseInt(data?.participants_count)} Peserta
                </Typography.Text>
              </div>
              <div>
                <CarryOutTwoTone />
                <Typography.Text strong>
                  {" "}
                  {data?.hour} Jam Pelajaran
                </Typography.Text>{" "}
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
            <Space
              style={{
                marginTop: 16,
              }}
            >
              <Button onClick={handleRemove} danger icon={<DeleteOutlined />}>
                Hapus
              </Button>
              <Button
                type="dashed"
                icon={<DeleteOutlined />}
                danger
                onClick={handleReset}
              >
                Reset Sertifikat
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default DetailWebinar;

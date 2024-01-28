import {
  createRating,
  unregisterUserWebinar,
} from "@/services/webinar.services";
import { formatDateWebinar } from "@/utils/client-utils";
import {
  CarryOutTwoTone,
  ClockCircleTwoTone,
  CloseOutlined,
  CloudDownloadOutlined,
  EditTwoTone,
  FolderOpenOutlined,
  RedoOutlined,
  StarOutlined,
  TagsTwoTone,
  VideoCameraAddOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { Alert, Stack, TypographyStylesProvider } from "@mantine/core";
import { IconExclamationMark } from "@tabler/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Rate,
  Row,
  Space,
  Typography,
  message,
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FormUserInformation from "./FormUserInformation";
import InformasiTTE from "./InformasiTTE";
import SyaratMendapatkanSertifikat from "./SyaratMendapatkanSertifikat";

const ModalRating = ({ open, onCancel, initialValues }) => {
  const router = useRouter();

  const id = router?.query?.id;

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate: ratingWebinar, isLoading: isLoadingRatingWebinar } =
    useMutation((data) => createRating(data), {
      onSuccess: () => {
        message.success("Berhasil memberi rating");
        onCancel();
      },
      onError: () => {
        message.error("Gagal memberi rating");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-user-detail", id]);
      },
    });

  const handleOk = async () => {
    const values = await form.validateFields();
    const data = {
      id,
      data: values,
    };

    ratingWebinar(data);
  };

  return (
    <Modal
      confirmLoading={isLoadingRatingWebinar}
      onOk={handleOk}
      title="Rating Webinar"
      centered
      open={open}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          rules={[
            {
              required: true,
              message: "Rating harus diisi",
            },
          ]}
          required
          name="rating"
          label="Rating"
        >
          <Rate />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "Komentar harus diisi" }]}
          extra="Yuk biasakan menambah komentar"
          required
          name="comment"
          label="Komentar"
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const Tombol = ({
  data,
  alreadyPoll,
  downloadCertificate,
  loadingDownloadCertificate,
}) => {
  const router = useRouter();
  const id = router.query.id;

  const handleDownload = () => {
    Modal.confirm({
      title: "Unduh Sertifikat",
      content: "Apakah anda yakin ingin mengunduh sertifikat?",
      okText: "Ya",
      centered: true,
      onOk: async () => {
        await downloadCertificate();
      },
    });
  };

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

  if (
    data?.is_allow_download_certificate &&
    alreadyPoll &&
    !data?.get_certificate
  ) {
    return (
      <Alert
        icon={<IconExclamationMark />}
        color="red"
        title="Anda Tidak mendapatkan sertifikat"
      >
        Mohon maaf anda tidak mendapatkan sertifikat karena tidak melakukan
        presensi sebelumnya. Cek di tab presensi
      </Alert>
    );
  }

  if (
    data?.is_allow_download_certificate &&
    alreadyPoll &&
    data?.get_certificate &&
    data?.status_download === "DOWNLOAD_PERSONAL_SIGNER"
  ) {
    return (
      <>
        <Button
          icon={<CloudDownloadOutlined />}
          type="primary"
          block
          onClick={handleDownload}
          loading={loadingDownloadCertificate}
        >
          Unduh Sertifikat
        </Button>
      </>
    );
  }

  if (
    data?.is_allow_download_certificate &&
    alreadyPoll &&
    data?.get_certificate &&
    (data?.status_download === "DOWNLOAD_SEAL" ||
      data?.status_download === "BELUM_TANDATANGAN_SEAL")
  ) {
    return (
      <>
        <Button
          icon={<CloudDownloadOutlined />}
          type="primary"
          block
          onClick={handleDownload}
          loading={loadingDownloadCertificate}
        >
          Unduh Sertifikat
        </Button>
      </>
    );
  }

  if (
    data?.is_allow_download_certificate &&
    alreadyPoll &&
    data?.get_certificate &&
    data?.status_download === "BELUM_TANDATANGAN_PERSONAL_SIGNER"
  ) {
    return (
      <>
        <Button icon={<RedoOutlined />} type="primary" block disabled>
          Proses Tanda Tangan ...
        </Button>
      </>
    );
  }
};

function DetailWebinarNew({
  data,
  downloadCertificate,
  loadingDownloadCertificate,
  alreadyPoll,
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { mutateAsync: unregister, isLoading: isLoadingUnregister } =
    useMutation((data) => unregisterUserWebinar(data), {
      onSuccess: () => {
        message.success("Berhasil membatalkan registrasi");
        router.push("/webinar-series/my-webinar");
      },
      onError: () => {
        message.error("Gagal membatalkan registrasi");
      },
    });

  const handleUnregister = () => {
    Modal.confirm({
      centered: true,
      title: "Batalkan Registrasi",
      content: "Apakah anda yakin ingin membatalkan registrasi webinar ini?",
      okText: "Ya",
      onOk: async () => {
        await unregister(router?.query?.id);
      },
    });
  };

  return (
    <>
      <ModalRating
        open={open}
        onCancel={handleClose}
        initialValues={{
          rating: data?.my_rating,
          comment: data?.my_rating_comment,
        }}
      />
      <Row gutter={[16, 16]}>
        <Col md={17} xs={24}>
          <Card>
            <Typography.Title level={4}>{data?.title}</Typography.Title>
            <Divider />
            <TypographyStylesProvider>
              <div
                dangerouslySetInnerHTML={{
                  __html: data?.description_markdown,
                }}
              />
            </TypographyStylesProvider>
          </Card>
        </Col>
        <Col md={7} xs={24}>
          <Card title="Informasi Event">
            <Stack>
              <InformasiTTE data={data?.deskripsi_tte_sertifikat} />
              <SyaratMendapatkanSertifikat data={data?.syarat} />
              {!data?.user_information && (
                <FormUserInformation data={data?.syarat} />
              )}
              <Tombol
                downloadCertificate={downloadCertificate}
                loadingDownloadCertificate={loadingDownloadCertificate}
                alreadyPoll={alreadyPoll}
                data={data}
              />
              {/* <UserInfo /> */}
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
              <Space>
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
                    <Divider type="vertical" />
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
                    <Divider type="vertical" />
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
                    <Divider type="vertical" />
                  </div>
                )}
              </Space>
              {data?.already_rating ? (
                <Space>
                  <Rate disabled defaultValue={data?.my_rating} />
                  <EditTwoTone
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={handleOpen}
                  />
                </Space>
              ) : (
                <Button
                  type="primary"
                  onClick={handleOpen}
                  icon={<StarOutlined />}
                >
                  Beri Rating Webinar
                </Button>
              )}
            </Stack>
            <Divider />
            {/* <GoogleEditInformation /> */}
            <Button
              block
              style={{
                marginBottom: 10,
              }}
              danger
              icon={<CloseOutlined />}
              onClick={handleUnregister}
            >
              Batal Registrasi
            </Button>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default DetailWebinarNew;

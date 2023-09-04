import { formatDateSimple } from "@/utils/client-utils";
import {
  ClockCircleTwoTone,
  CloseOutlined,
  FolderTwoTone,
  PushpinTwoTone,
  SearchOutlined,
  SmileOutlined,
  TagsTwoTone,
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
  Tag,
  Typography,
} from "antd";
import { useRouter } from "next/router";

const Tombol = ({
  data,
  register,
  unregister,
  registerLoading,
  unregisterLoading,
}) => {
  const router = useRouter();
  const id = router.query.id;

  const handleRegister = () => {
    register(id);
  };

  const handleDetail = () => {
    const my_webinar = data?.my_webinar;
    router.push(`/webinar-series/my-webinar/${my_webinar}/detail`);
  };

  const handleUnregister = () => {
    unregister(id);
  };

  if (!data?.is_open && !data?.my_webinar) {
    return (
      <Button icon={<SmileOutlined />} block disabled>
        Ditutup
      </Button>
    );
  }

  if (data?.is_open && !data?.my_webinar) {
    return (
      <Button
        loading={registerLoading}
        disabled={registerLoading}
        icon={<SmileOutlined />}
        block
        type="primary"
        onClick={handleRegister}
      >
        Registrasi
      </Button>
    );
  }

  if (data?.my_webinar) {
    return (
      <Space>
        {data?.is_open && (
          <Button
            disabled={unregisterLoading}
            loading={unregisterLoading}
            onClick={handleUnregister}
            danger
            icon={<CloseOutlined />}
          >
            Batal Registrasi
          </Button>
        )}
        <Button
          onClick={handleDetail}
          icon={<SearchOutlined />}
          block
          type="primary"
        >
          Detail
        </Button>
      </Space>
    );
  }
};

function DetailWebinarNew({
  data,
  register,
  registerLoading,
  unregister,
  unregisterLoading,
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
            <Typography.Title level={4}>{data?.title}</Typography.Title>
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
              <div>
                <FolderTwoTone />{" "}
                <Typography.Text strong>Materi & Sertifikat</Typography.Text>
              </div>
              <div>
                <Tag color={data?.my_webinar ? "green" : "red"}>
                  {data?.my_webinar ? "Sudah Registrasi" : "Belum Registrasi"}
                </Tag>
              </div>
            </Stack>
            <Divider />
            <Tombol
              register={register}
              registerLoading={registerLoading}
              unregister={unregister}
              unregisterLoading={unregisterLoading}
              data={data}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default DetailWebinarNew;

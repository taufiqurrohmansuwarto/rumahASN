import { formatDateWebinar } from "@/utils/client-utils";
import {
  CarryOutTwoTone,
  ClockCircleTwoTone,
  CloseOutlined,
  SearchOutlined,
  SmileOutlined,
  TagsTwoTone,
} from "@ant-design/icons";
import { Stack, TypographyStylesProvider } from "@mantine/core";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { trim } from "lodash";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

const FormGoogleParticipants = ({
  data,
  register,
  unregister,
  registerLoading,
  unregisterLoading,
  open,
  id,
  onCancel,
}) => {
  const [form] = Form.useForm();

  const handleFinish = async () => {
    const value = await form.validateFields();
    const payload = {
      id,
      data: {
        jabatan: {
          jabatan: trim(value.jabatan),
        },
        perangkat_daerah: {
          detail: trim(value.perangkat_daerah),
        },
        username: trim(value.username),
        gelar_depan: trim(value.gelar_depan),
        gelar_belakang: trim(value.gelar_belakang),
        employee_number: trim(value.employee_number),
      },
    };
    register(payload);
  };

  return (
    <Modal
      centered
      title="Registrasi Webinar"
      onOk={handleFinish}
      confirmLoading={registerLoading}
      open={open}
      width={600}
      onCancel={onCancel}
      destroyOnClose
    >
      <Alert
        type="info"
        description="Jika Anda Pegawai Pemerintah Provinsi Jawa Timur kami sarankan menggunakan akun SIMASTER/PTTPK"
      />
      <Form form={form} layout="vertical">
        <Form.Item
          normalize={
            // automatic capitalize
            (value) => value?.toUpperCase()
          }
          label="Gelar Depan"
          extra="Jika Tidak diisi Kosongkan saja"
          name="gelar_depan"
        >
          <Input />
        </Form.Item>
        <Form.Item
          normalize={
            // automatic capitalize
            (value) => value?.toUpperCase()
          }
          label="Gelar Belakang"
          extra="Jika Tidak diisi Kosongkan saja"
          name="gelar_belakang"
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Nama lengkap harus diisi",
            },
          ]}
          normalize={
            // automatic capitalize
            (value) => value?.toUpperCase()
          }
          label="Nama Lengkap"
          extra="Nama Lengkap tanpa gelar"
          name="username"
          required
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Nomer Pegawai harus diisi",
            },
          ]}
          extra="Jika kamu PNS gunakan NIP, atau gunakan Nomer Pegawai jika kamu bukan PNS"
          label="Nomer Pegawai"
          name="employee_number"
          required
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Jabatan harus diisi",
            },
          ]}
          normalize={
            // automatic capitalize
            (value) => value?.toUpperCase()
          }
          label="Jabatan"
          name="jabatan"
          required
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Instansi harus diisi",
            },
          ]}
          normalize={
            // automatic capitalize
            (value) => value?.toUpperCase()
          }
          extra="Tulis secara detail Instansi anda dengan pemisah tanda hubung (-). Contoh : Pemerintah Provinsi Kalimantan Tengah - Biro Pemerintahan"
          label="Instansi"
          name="perangkat_daerah"
          required
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const Tombol = ({
  data,
  register,
  unregister,
  registerLoading,
  unregisterLoading,
}) => {
  const { data: user, status } = useSession();

  // modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const router = useRouter();
  const id = router.query.id;

  const handleRegister = () => {
    if (user?.user?.group === "GOOGLE") {
      handleOpen();
    } else {
      Modal.confirm({
        title: "Registrasi Webinar",
        content: "Apakah anda yakin ingin mendaftar webinar ini?",
        okText: "Ya",
        centered: true,
        onOk: async () => await register({ id, data: {} }),
      });
    }
  };

  const handleDetail = () => {
    const my_webinar = data?.my_webinar;
    router.push(`/webinar-series/my-webinar/${my_webinar}/detail`);
  };

  const handleUnregister = () => {
    Modal.confirm({
      title: "Batal Registrasi Webinar",
      content: "Apakah anda yakin ingin membatalkan registrasi webinar ini?",
      okText: "Ya",
      centered: true,
      onOk: async () => {
        await unregister(id);
        handleClose();
      },
    });
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
      <>
        <FormGoogleParticipants
          id={id}
          data={data}
          onCancel={handleClose}
          open={open}
          register={register}
          registerLoading={registerLoading}
          unregister={unregister}
          unregisterLoading={unregisterLoading}
        />
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
      </>
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
        <Col md={8} xs={24}>
          <Card title="Informasi Event">
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

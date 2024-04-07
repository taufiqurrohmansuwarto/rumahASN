import { createMeeting } from "@/services/coaching-clinics.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  message,
} from "antd";
import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

dayjs.locale("id");

const ModalCoaching = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createMeeting(data),
    {
      onSuccess: () => {
        message.success("Berhasil membuat jadwal coaching");
        queryClient.invalidateQueries(["meetings"]);
        onCancel();
      },
      onError: () => {
        message.error("Gagal membuat jadwal coaching");
      },
    }
  );

  const handleFinish = async () => {
    const result = await form.validateFields();
    const payload = {
      ...result,
      start_date: dayjs(result.start_date).format("YYYY-MM-DD"),
      start_hours: dayjs(result.start_hours).format("HH:mm:ss"),
      end_hours: dayjs(result.end_hours).format("HH:mm:ss"),
    };
    create(payload);
  };

  return (
    <Modal
      centered
      width={600}
      onOk={handleFinish}
      confirmLoading={isLoadingCreate}
      title="Buat Jadwal Coaching"
      open={open}
      onCancel={onCancel}
    >
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Judul harus diisi",
            },
          ]}
          name="title"
          label="Judul"
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "Deskripsi harus diisi" }]}
          name="description"
          label="Deskripsi"
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          help="Status Privat tidak akan muncul dijadwal coaching clinic secara public"
          valuePropName="checked"
          name="is_private"
          label="Privat?"
        >
          <Checkbox />
        </Form.Item>
        <Row gutter={[16, 16]}>
          <Col md={8} xs={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Tanggal harus diisi",
                },
              ]}
              name="start_date"
              label="Tanggal"
            >
              <DatePicker />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Jam mulai harus diisi",
                },
              ]}
              name="start_hours"
              label="Mulai Jam"
            >
              <DatePicker.TimePicker />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Jam berakhir harus diisi",
                },
              ]}
              name="end_hours"
              label="Berakhir Jam"
            >
              <DatePicker.TimePicker />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Jumlah peserta harus diisi",
            },
          ]}
          name="max_participants"
          label="Jumlah Peserta"
        >
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function CreateCoaching() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <ModalCoaching open={open} onCancel={handleClose} />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleOpen}
        style={{
          marginBottom: 20,
        }}
        // shape="round"
      >
        Buat Coaching
      </Button>
    </div>
  );
}

export default CreateCoaching;

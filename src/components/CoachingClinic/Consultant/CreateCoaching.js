import { createMeeting } from "@/services/coaching-clinics.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
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
import moment from "moment";
import { PlusOutlined } from "@ant-design/icons";

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
      start_date: moment(result.start_date).format("DD-MM-YYYY"),
      start_hours: moment(result.start_hours).format("HH:mm:ss"),
      end_hours: moment(result.end_hours).format("HH:mm:ss"),
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
        <Form.Item name="title" label="Judul">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Deskripsi">
          <Input.TextArea />
        </Form.Item>
        <Row gutter={[16, 16]}>
          <Col md={8} xs={24}>
            <Form.Item name="start_date" label="Tanggal">
              <DatePicker />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item name="start_hours" label="Mulai Jam">
              <DatePicker.TimePicker />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item name="end_hours" label="Berakhir Jam">
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
      >
        Buat Jawdal Coaching
      </Button>
    </div>
  );
}

export default CreateCoaching;

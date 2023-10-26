import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
} from "antd";
import React from "react";

const ModalCoaching = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const handleFinish = async () => {
    const result = await form.validateFields();
  };

  return (
    <Modal
      centered
      width={600}
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
            <Form.Item name="started_at" label="Tanggal">
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
          name="max_total_participants"
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
      <Button onClick={handleOpen}>Buat Jawdal Coaching</Button>
    </div>
  );
}

export default CreateCoaching;

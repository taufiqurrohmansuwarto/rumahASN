import { Button, DatePicker, Form, Input, Modal, Select } from "antd";
import { useState } from "react";
import dayjs from "dayjs";

function ModalCreatePenghargaan({ open, onCancel, onSubmit, loading }) {
  const format = "DD-MM-YYYY";
  const [form] = Form.useForm();

  const handleOk = async () => {
    const value = await form.validateFields();
    const payload = {
      ...value,
      skDate: dayjs(value.skDate).format("YYYY-MM-DD"),
      tahun: dayjs(value.tahun).format("YYYY"),
    };

    console.log(payload);
  };

  return (
    <>
      <Modal
        title="Tambah Penghargaan"
        open={open}
        onCancel={onCancel}
        onOk={handleOk}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="harga_id" label="Jenis Penghargaan">
            <Select>
              <Select.Option value="1">Penghargaan Satya Lencana</Select.Option>
              <Select.Option value="2">Penghargaan Karya Satya</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="skDate" label="Tanggal SK">
            <DatePicker format={format} />
          </Form.Item>
          <Form.Item name="skNomor" label="Nomor SK">
            <Input />
          </Form.Item>
          <Form.Item name="tahun" label="Tahun">
            <DatePicker picker="year" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

const CreatePenghargaan = ({ onSubmit, loading }) => {
  const [open, setOpen] = useState();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button type="primary" onClick={handleOpen}>
        Tambah Penghargaan
      </Button>
      <ModalCreatePenghargaan
        open={open}
        onCancel={handleClose}
        onSubmit={onSubmit}
        loading={loading}
      />
    </>
  );
};

export default CreatePenghargaan;

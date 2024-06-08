import { Button, DatePicker, Form, Input, Modal, Select } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import FormPenghargaan from "./FormPenghargaan";

function ModalCreatePenghargaan({ open, onCancel, onSubmit, loading, nip }) {
  const format = "DD-MM-YYYY";
  const [form] = Form.useForm();

  const handleOk = async () => {
    const value = await form.validateFields();
    const data = {
      ...value,
      skDate: dayjs(value.skDate).format(format),
      tahun: dayjs(value.tahun).format("YYYY"),
    };

    const payload = {
      nip,
      data,
    };

    await onSubmit(payload);
    onCancel();
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
          <FormPenghargaan name="hargaId" label="Jenis Penghargaan" />
          <Form.Item
            rules={[
              {
                required: true,
                message: "Tanggal SK harus diisi",
              },
            ]}
            name="skDate"
            label="Tanggal SK"
          >
            <DatePicker format={format} />
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Nomor SK harus diisi",
              },
            ]}
            name="skNomor"
            label="Nomor SK"
          >
            <Input />
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Tahun harus diisi",
              },
            ]}
            name="tahun"
            label="Tahun"
          >
            <DatePicker picker="year" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

const CreatePenghargaan = ({ nip, onSubmit, loading }) => {
  const [open, setOpen] = useState();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button type="primary" onClick={handleOpen}>
        Tambah Penghargaan
      </Button>
      <ModalCreatePenghargaan
        nip={nip}
        open={open}
        onCancel={handleClose}
        onSubmit={onSubmit}
        loading={loading}
      />
    </>
  );
};

export default CreatePenghargaan;

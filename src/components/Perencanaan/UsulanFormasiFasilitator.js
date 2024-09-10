import { Button, Form, Input, Modal } from "antd";
import { useState } from "react";
import FormUnorFasilitator from "@/components/Perencanaan/FormUnorFasilitator";

const ModalUsulanFormasi = ({ open, onClose }) => {
  const [form] = Form.useForm();

  return (
    <Modal open={open} onCancel={onClose} title="Tambah Usulan Formasi">
      <Form layout="vertical" form={form}>
        <Form.Item label="Nama Pegawai" name="nama">
          <Input />
        </Form.Item>
        <FormUnorFasilitator />
      </Form>
    </Modal>
  );
};

function UsulanFormasiFasilitator() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen}>Tambah Usulan Formasi</Button>
      <ModalUsulanFormasi open={open} onClose={handleClose} />
    </div>
  );
}

export default UsulanFormasiFasilitator;

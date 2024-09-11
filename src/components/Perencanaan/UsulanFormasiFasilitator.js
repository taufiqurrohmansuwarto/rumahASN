import FormUnorFasilitator from "@/components/Perencanaan/FormUnorFasilitator";
import { Button, Form, Modal } from "antd";
import { useState } from "react";
import FormSiasnPendidikan from "./FormSiasnPendidikan";
import FormSimasterJFU from "./FormSimasterJFU";

const ModalUsulanFormasi = ({ open, onClose }) => {
  const [form] = Form.useForm();

  return (
    <Modal open={open} onCancel={onClose} title="Tambah Usulan Formasi">
      <Form layout="vertical" form={form}>
        <FormUnorFasilitator />
        <FormSimasterJFU />
        <FormSiasnPendidikan />
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

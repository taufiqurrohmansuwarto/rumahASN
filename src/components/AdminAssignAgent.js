import { Form, Button, Modal } from "antd";
import React, { useState } from "react";

const ModalPicker = ({ open, cancelModal }) => {
  const [form] = Form.useForm();
  return (
    <Modal centered title="Pilih Agent" open={open} onCancel={cancelModal}>
      <Form form={form}></Form>
      <div>hello world</div>
    </Modal>
  );
};

function AdminAssignAgent({ id }) {
  const [openModal, setOpenModal] = useState();
  const cancelModal = () => setOpenModal(false);

  const handleOpen = () => setOpenModal(true);

  return (
    <div>
      <Button onClick={handleOpen}>Assign Agent</Button>
      <ModalPicker open={openModal} cancelModal={cancelModal} />
    </div>
  );
}

export default AdminAssignAgent;

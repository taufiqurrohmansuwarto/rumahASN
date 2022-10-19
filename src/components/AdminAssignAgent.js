import { useMutation, useQuery } from "@tanstack/react-query";
import { Form, Button, Modal } from "antd";
import React, { useState } from "react";
import { listAgents } from "../../services/admin.services";

const ModalPicker = ({ open, cancelModal }) => {
  const [form] = Form.useForm();
  const { mutate: assignAgents, isLoading } = useMutation((data) =>
    assignAgents(data)
  );
  return (
    <Modal centered title="Pilih Agent" open={open} onCancel={cancelModal}>
      <Form form={form}></Form>
    </Modal>
  );
};

function AdminAssignAgent({ id }) {
  const { data: agents, isLoading } = useQuery(["agents"], () => listAgents(), {
    refetchOnWindowFocus: false,
  });

  const [openModal, setOpenModal] = useState();
  const cancelModal = () => setOpenModal(false);

  const handleOpen = () => setOpenModal(true);

  return (
    <div>
      <Button onClick={handleOpen}>Assign Agent</Button>
      <ModalPicker agents={agents} open={openModal} cancelModal={cancelModal} />
    </div>
  );
}

export default AdminAssignAgent;

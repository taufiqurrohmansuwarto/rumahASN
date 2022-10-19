import { useMutation, useQuery } from "@tanstack/react-query";
import { Form, Button, Modal, Select, Space, Avatar } from "antd";
import React, { useState } from "react";
import { listAgents } from "../../services/admin.services";

const ModalPicker = ({ open, cancelModal, agents }) => {
  const [form] = Form.useForm();
  const { mutate: assignAgents, isLoading } = useMutation((data) =>
    assignAgents(data)
  );

  const handleOk = async () => {
    try {
      const result = await form.validateFields();
      console.log(result);
    } catch (error) {}
  };

  return (
    <Modal
      onOk={handleOk}
      centered
      width={700}
      title="Pilih Agent"
      open={open}
      onCancel={cancelModal}
    >
      <Form form={form}>
        <Form.Item label="Agent" name="agent_id">
          <Select showSearch optionFilterProp="name">
            {agents?.map((agent) => (
              <Select.Option
                key={agent?.custom_id}
                name={agent?.username}
                value={agent?.custom_id}
              >
                <Space>
                  <Avatar size="small" src={agent?.image} />
                  {agent?.username}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

function AdminAssignAgent({ id }) {
  const { data: agents, isLoading: isLoadingAgents } = useQuery(
    ["agents"],
    () => listAgents(),
    {
      refetchOnWindowFocus: false,
    }
  );

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

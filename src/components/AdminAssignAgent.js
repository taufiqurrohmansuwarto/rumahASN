import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, Button, Modal, Select, Space, Avatar, message } from "antd";
import React, { useState } from "react";
import {
  listAgents,
  assignAgents,
  detailTicket,
} from "../../services/admin.services";

const ModalPicker = ({ open, cancelModal, agents, ticketId }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate: assign, isLoading } = useMutation(
    (data) => assignAgents(data),
    {
      onSuccess: () => {
        message.success("Berhasil assign agent");
        cancelModal();
      },
      onSettled: () => {
        queryClient.invalidateQueries(["admin-tickets", ticketId]);
      },
      onError: () => {
        message.error("Gagal assign agent");
      },
    }
  );

  const handleOk = async () => {
    const result = await form.validateFields();
    const data = {
      id: ticketId,
      data: {
        assignee: result.assignee,
      },
    };

    // assign(data);
  };

  return (
    <Modal
      onOk={handleOk}
      confirmLoading={isLoading}
      centered
      width={700}
      title="Pilih Agent"
      open={open}
      onCancel={cancelModal}
    >
      <Form form={form}>
        <Form.Item
          label="Agent"
          name="assignee"
          rules={[{ required: true, message: "Tidak boleh kosong" }]}
        >
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

  const { data, isLoading } = useQuery(
    ["admin-tickets", id],
    () => detailTicket(id),
    {
      refetchOnWindowFocus: false,
    }
  );

  const [openModal, setOpenModal] = useState();
  const cancelModal = () => setOpenModal(false);

  const handleOpen = () => setOpenModal(true);

  return (
    <div>
      {data?.assignee === null ? (
        <Button onClick={handleOpen}>Assign Agent</Button>
      ) : (
        <div>{data?.agent?.username} belum di approve</div>
      )}
      <ModalPicker
        ticketId={id}
        agents={agents}
        open={openModal}
        cancelModal={cancelModal}
      />
    </div>
  );
}

export default AdminAssignAgent;

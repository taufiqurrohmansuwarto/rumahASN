import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, Button, Modal, Select, Space, Avatar, message } from "antd";
import React, { useState } from "react";
import {
  listAgents,
  assignAgents,
  detailTicket,
  removeAgents,
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
    assign(data);
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

const Tombol = ({ data, openModalAgent }) => {
  const queryClient = useQueryClient();

  const { mutate: removeAgent, isLoading } = useMutation(
    (data) => removeAgents(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["admin-tickets", data?.id]);
        message.success("Berhasil remove agent");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["admin-tickets", data?.id]);
      },
      onError: () => {
        message.error("Gagal remove agent");
      },
    }
  );

  const handleRemove = () => {
    Modal.confirm({
      title: "Apakah anda yakin?",
      content: "Anda akan menghapus agent dari tiket ini",
      onOk: () => {
        removeAgent(data?.id);
      },
    });
  };

  if (data?.assignee === null) {
    return (
      <Button type="primary" onClick={openModalAgent}>
        Pilih Agent Untuk menyelesaikan
      </Button>
    );
  }

  if (data?.assinee !== null && data?.status_code === "DIAJUKAN") {
    return (
      <Button danger type="primary" onClick={handleRemove}>
        Hapus Agent
      </Button>
    );
  }

  if (data?.assignee !== null && data?.status_code === "DIKERJAKAN") {
    return <div>{data?.assignee?.username} sedang mengerjakan tiket ini</div>;
  }

  if (data?.assignee !== null && data?.status_code === "SELESAI") {
    return <div>{data?.assignee?.username} telah menyelesaikan tiket ini</div>;
  }
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
      <Tombol data={data} openModalAgent={handleOpen} />
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

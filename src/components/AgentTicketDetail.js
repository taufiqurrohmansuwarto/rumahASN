import { Paper, Stack, Text, Space as SpaceMantine } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message, Modal, Space, Form, Input } from "antd";
import React, { useState } from "react";
import { akhiriPekerjaanSelesai } from "../../services/agents.services";
import TicketProperties from "./TicketProperties";
import TimelinePekerjaan from "./TimelinePekerjaan";

const SelesaiModal = ({ open, onCancel, data }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate: akhirPekerjaan, isLoading: isLoadingPekerjaan } = useMutation(
    (data) => akhiriPekerjaanSelesai(data),
    {
      onSettled: () =>
        queryClient.invalidateQueries(["agent-tickets", dat?.id]),
      onSuccess: () => {
        message.success("Berhasil mengakhiri pekerjaan");
        queryClient.invalidateQueries(["agent-tickets", data?.id]);
        onCancel();
      },
      onError: () => message.error("Gagal mengakhiri pekerjaan"),
    }
  );

  const handleOk = async () => {
    const result = await form.validateFields();
    const currentData = {
      id: data?.id,
      data: {
        ...result,
      },
    };
    akhirPekerjaan(currentData);
  };

  return (
    <Modal
      onOk={handleOk}
      title="Selesaikan Pekerjaan"
      confirmLoading={isLoadingPekerjaan}
      open={open}
      onCancel={onCancel}
    >
      <Form form={form}>
        <Form.Item
          rules={[{ required: true, message: "Tidak boleh kosong" }]}
          name="assignee_reason"
          label="Solusi"
        >
          <Input.TextArea rows={5} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const PropertiTicket = ({ data }) => {
  return (
    <div>
      <Text size="md" weight={500} color="dimmed">
        Sub Kategori : {data?.sub_category?.name}
      </Text>
      <SpaceMantine />
      <Text size="xs" weight={500}>
        Prioritas : {data?.priority_code}
      </Text>
    </div>
  );
};

function AgentTicketDetail({ data }) {
  const [open, setOpen] = useState(false);

  const handleCancel = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <Paper withBorder p="lg" radius="md" shadow="md">
      <Stack>
        <Text size="md" weight={500}>
          {data?.title}
        </Text>
        <Text color="dimmed" size="xs">
          {data?.content}
        </Text>
        <TimelinePekerjaan data={data} />
        <PropertiTicket data={data} />
        <Space>
          <Button danger onClick={handleOpen}>
            Selesai
          </Button>
          <TicketProperties data={data} />
        </Space>
        <SelesaiModal data={data} open={open} onCancel={handleCancel} />
      </Stack>
    </Paper>
  );
}

export default AgentTicketDetail;

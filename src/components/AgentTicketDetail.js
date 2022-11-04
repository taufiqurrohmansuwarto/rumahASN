import { Paper, Stack, Text, Space as SpaceMantine } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message, Modal, Space, Form, Input } from "antd";
import React, { useState } from "react";
import TicketProperties from "./TicketProperties";
import TimelinePekerjaan from "./TimelinePekerjaan";

const SelesaiModal = ({ open, onCancel, data }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const handleOk = async () => {
    const result = await form.validateFields();
    console.log(result);
  };

  return (
    <Modal
      onOk={handleOk}
      title="Selesaikan Pekerjaan"
      open={open}
      onCancel={onCancel}
    >
      <Form form={form}>
        <Form.Item name="assignee_reason" label="Solusi">
          <Input.TextArea />
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

  const queryClient = useQueryClient();

  const { mutateAsync: akhiriSelesai } = useMutation(
    (id) => akhiriPekerjaanSelesai(id),
    {
      onSettled: () =>
        queryClient.invalidateQueries(["agent-tickets", router?.query?.id]),
      onSuccess: () => message.success("Berhasil mengakhiri pekerjaan"),
      onError: () => message.error("Gagal mengakhiri pekerjaan"),
    }
  );

  const handleAkhiriSelesai = () => {
    Modal.confirm({
      title: "Akhiri pekerjaan",
      content:
        "Apakah anda yakin ingin mengakhiri pekerjaan ini dengan status selesai?",
      onOk: async () => {
        await akhiriSelesai(router?.query?.id);
      },
    });
  };

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

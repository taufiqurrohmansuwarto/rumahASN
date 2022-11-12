import { Alert, Stack } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message, Modal, Result } from "antd";
import { capitalize, lowerCase } from "lodash";
import React, { useState } from "react";
import { akhiriPekerjaanSelesai } from "../../services/agents.services";
import { statusTicket } from "../../utils";
import CustomerAdminAgent from "./CustomerAdminAgent";
import { DetailTicket } from "./DetailTicket";
import TicketProperties from "./TicketProperties";
import TimelinePekerjaan from "./TimelinePekerjaan";

const SelesaiModal = ({ open, onCancel, data }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate: akhirPekerjaan, isLoading: isLoadingPekerjaan } = useMutation(
    (data) => akhiriPekerjaanSelesai(data),
    {
      onSettled: () =>
        queryClient.invalidateQueries(["agent-tickets", data?.id]),
      onSuccess: () => {
        message.success("Berhasil mengakhiri pekerjaan");
        queryClient.invalidateQueries(["agent-tickets", data?.id]);
        onCancel();
      },
      onError: (data) => {
        const { message: messageError } = data?.response?.data;
        message.error(`Gagal mengakhiri pekerjaan, ${messageError}`);
        onCancel();
      },
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
      centered
      width={800}
      confirmLoading={isLoadingPekerjaan}
      open={open}
      onCancel={onCancel}
    >
      <Alert
        color="yellow"
        mb={10}
        title="Perhatian"
        icon={<IconAlertCircle size={16} />}
      >
        Jangan lupa bro! ubah properti tiketnya biar kedata lebih mudah. Terdata
        sama dengan lu membantu semua problem terdefinisi supaya tepat sasaran.
      </Alert>
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

function AgentTicketDetail({ data }) {
  const [open, setOpen] = useState(false);

  const handleCancel = () => setOpen(false);
  const handleOpen = () => setOpen(true);

  return (
    <Result
      title={`Status Tiket ${capitalize(data?.status_code)}!`}
      subTitle={`Tiket dengan nomor ${data?.ticket_number} telah ${lowerCase(
        data?.status_code
      )}`}
      status={statusTicket(data?.status_code)}
      extra={[
        <Button key="open" danger onClick={handleOpen}>
          Selesai
        </Button>,
        <TicketProperties key="ubah" data={data} />,
      ]}
    >
      <Stack>
        <DetailTicket data={data} />
        <Stack>
          <TimelinePekerjaan data={data} />
          <CustomerAdminAgent data={data} />
          <SelesaiModal data={data} open={open} onCancel={handleCancel} />
        </Stack>
      </Stack>
    </Result>
  );
}

export default AgentTicketDetail;

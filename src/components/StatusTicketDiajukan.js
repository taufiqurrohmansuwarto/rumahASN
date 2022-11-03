import { Alert, Text, Title } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Result,
  Form,
  Modal,
  Input,
  Select,
  Popconfirm,
  message,
} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import { deleteTicket, updateTicket } from "../../services/users.services";
import TimelinePekerjaan from "./TimelinePekerjaan";

const ModalUpdate = ({ visible, onCancel, update, data, loadingUpdate }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const values = await form.validateFields();
    const currentData = { id: data?.id, data: values };
    update(currentData);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      title="Update Ticket"
      confirmLoading={loadingUpdate}
      centered
      okText="Update"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={handleOk}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ title: data?.title, content: data?.content }}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            {
              required: true,
              message: "Please input the title of collection!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="content" label="Description">
          <Input.TextArea rows={10} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function StatusTicketDiajukan({ data }) {
  const [visible, setVisible] = useState();
  const handleCancel = () => setVisible(false);
  const handleOpen = () => setVisible(true);

  const queryClient = useQueryClient();
  const router = useRouter();

  const backToSemua = () => router?.push("/tickets/semua");

  const { mutate: hapus, isLoading: loadingHapus } = useMutation(
    (id) => deleteTicket(id),
    {
      onSettled: () => queryClient.invalidateQueries(["tickets", data?.id]),
      onError: () => {
        message.error("Gagal menghapus ticket");
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["tickets", data?.id]);
        backToSemua();
      },
    }
  );

  const { mutate: update, isLoading: loadingUpdate } = useMutation(
    (data) => updateTicket(data),
    {
      onSettled: () => queryClient.invalidateQueries(["tickets", data?.id]),
      onError: () => {
        message.error("Gagal mengupdate ticket");
      },
      onSuccess: () => {
        message.success("Berhasil mengupdate ticket");
        queryClient.invalidateQueries(["tickets", data?.id]);
      },
    }
  );

  const handleHapus = () => {
    hapus(data?.id);
  };

  return (
    <Result
      title="Tiket sedang dicarikan agent"
      subTitle="Status tiketmu masih dicarikan agent ya... Mohon bersabar"
      extra={[
        <Button key="rubah" type="primary" onClick={handleOpen}>
          Update
        </Button>,
        <Popconfirm
          title="Apakah kamu yakin ingin menghapus tiketmu?"
          key="hapus"
          onConfirm={handleHapus}
        >
          <Button loading={loadingHapus}>Hapus</Button>
        </Popconfirm>,
      ]}
    >
      <Alert>
        <Title>{data?.title}</Title>
        <Text>{data?.content}</Text>
        <div style={{ marginTop: 10 }}>
          <TimelinePekerjaan data={data} />
        </div>
      </Alert>
      <ModalUpdate
        data={data}
        update={update}
        loadingUpdate={loadingUpdate}
        visible={visible}
        onCancel={handleCancel}
      />
    </Result>
  );
}

export default StatusTicketDiajukan;

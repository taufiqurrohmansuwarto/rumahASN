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

const ModalUpdate = ({ visible, onCancel, onCreate, data }) => {
  const [form] = Form.useForm();
  return (
    <Modal
      visible={visible}
      title="Update Ticket"
      okText="Update"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{
          modifier: "public",
        }}
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
        <Form.Item name="description" label="Description">
          <Input type="textarea" />
        </Form.Item>
        <Form.Item name="status" label="Status">
          <Select>
            <Select.Option value="open">Open</Select.Option>
            <Select.Option value="open">Open</Select.Option>
          </Select>
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

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateTicket(data),
    {
      onSettled: () => queryClient.invalidateQueries(["tickets", data?.id]),
      onError: () => {
        message.error("Gagal mengupdate ticket");
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["tickets", data?.id]);
      },
    }
  );

  const handleUpdate = (data) => {
    update(data);
  };

  const handleHapus = () => {
    hapus(data?.id);
  };

  return (
    <Result
      title="Tiket sedang dicarikan agent"
      subTitle="Status tiketmu masih dicarikan agent ya... Mohon bersabar"
      extra={[
        <Button key="rubah" type="primary">
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
    </Result>
  );
}

export default StatusTicketDiajukan;

import { getUser, updateUser } from "@/services/guests-books.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Empty,
  Skeleton,
  Button,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import { useState } from "react";
import GuestBookScheduleVisit from "./GuestBookScheduleVisit";

const FormUserModal = ({ open, onCancel, onSubmit, loading }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (data) => {
    const value = await form.validateFields();
    onSubmit(value);
  };

  return (
    <Modal
      confirmLoading={loading}
      title="Masukkan Data Diri"
      onOk={handleSubmit}
      open={open}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Nama" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          rules={[{ type: "email" }, { required: true }]}
          name="email"
          label="Email"
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[{ type: "phone" }, { required: true }]}
          name="phone"
          label="Nomor Telepon"
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }]}
          name="id_card"
          label="Nomor KTP"
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const UserEmpty = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { mutate: edit, isLoading } = useMutation((data) => updateUser(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["guest-book-user"]);
      message.success("Berhasil mengubah data diri");
    },
    onError: (error) => {
      message.error("Gagal mengubah data diri");
    },
  });

  return (
    <Empty description="Silahkan masukkan data diri anda terlebih dahulu">
      <Button onClick={handleOpen}>Masukkan Data Diri</Button>
      <FormUserModal
        open={open}
        onCancel={handleClose}
        onSubmit={edit}
        loading={isLoading}
      />
    </Empty>
  );
};

const GuestsBookUser = () => {
  const { data, isLoading } = useQuery(
    ["guest-book-user"],
    () => getUser(),
    {}
  );

  return (
    <Card title="Daftar Kunjungan">
      <Skeleton active loading={isLoading}>
        {data ? <GuestBookScheduleVisit /> : <UserEmpty />}
      </Skeleton>
    </Card>
  );
};

export default GuestsBookUser;

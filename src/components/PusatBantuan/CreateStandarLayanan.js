import { Button, Form, Input, message } from "antd";
import React, { useState } from "react";
import { Modal } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStandarLayanan } from "@/services/layanan.services";

const ModalStandarLayanan = ({ open, onClose, create, loading }) => {
  const [form] = Form.useForm();

  const handleFinish = async () => {
    const values = await form.validateFields();
    await create(values);
    form.resetFields();
  };

  return (
    <Modal
      onOk={handleFinish}
      confirmLoading={loading}
      title="Tambah Standar Layanan"
      open={open}
      onCancel={onClose}
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="nama_pelayanan"
          rules={[{ required: true, message: "Nama Layanan harus diisi" }]}
          label="Nama Layanan"
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default function CreateStandarLayanan() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createStandarLayanan(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["standar-pelayanan"]);
        message.success("Berhasil");
        setOpen(false);
      },
      onError: () => {
        message.error("Gagal");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["standar-pelayanan"]);
      },
    }
  );

  return (
    <div>
      <ModalStandarLayanan
        create={create}
        loading={isLoadingCreate}
        open={open}
        onClose={() => setOpen(false)}
      />
      <Button
        style={{
          marginBottom: 10,
        }}
        type="primary"
        onClick={() => setOpen(true)}
      >
        Layanan
      </Button>
    </div>
  );
}

import { createPermission } from "@/services/managements.services";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Select, message } from "antd";
import React from "react";

const CreatePermissionModal = ({ open, onCancel, create, loading }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await create(values);
      form.resetFields();
    } catch (error) {
      message.error("Gagal menambahkan role");
    }
  };

  return (
    <Modal
      onOk={handleOk}
      confirmLoading={loading}
      title="Tambah Permissions"
      open={open}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Nama Permission/Action">
          <Input />
        </Form.Item>
        <Form.Item name="resource" label="Resource">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Deksripsi">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="attributes" label="Attribute">
          <Select mode="tags" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function CreatePermissions() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createPermission(data),
    {
      onSuccess: () => {
        setOpen(false);
        message.success("Berhasil menambahkan permission");
      },
      onError: () => {
        message.error("Gagal menambahkan permission");
      },
      onSettled: () => {
        queryClient.invalidateQueries("roles");
      },
    }
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        type="primary"
        style={{
          marginBottom: 16,
        }}
        onClick={handleOpen}
        icon={<PlusOutlined />}
      >
        Permission
      </Button>
      <CreatePermissionModal
        create={create}
        loading={isLoadingCreate}
        open={open}
        onCancel={handleClose}
      />
    </>
  );
}

export default CreatePermissions;

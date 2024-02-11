import { createRole } from "@/services/managements.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, message } from "antd";
import React from "react";

const CreateRoleModal = ({ open, onCancel, create, loading }) => {
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
      title="Tambah Role"
      open={open}
      onCancel={onCancel}
    >
      <Form form={form}>
        <Form.Item name="name" label="Nama Role">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function CreateRole() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createRole(data),
    {
      onSuccess: () => {
        setOpen(false);
      },
      onError: () => {},
      onSettled: () => {
        queryClient.invalidateQueries("roles");
      },
    }
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button onClick={handleOpen}>Create Role</Button>
      <CreateRoleModal
        create={create}
        loading={isLoadingCreate}
        open={open}
        onCancel={handleClose}
      />
    </>
  );
}

export default CreateRole;

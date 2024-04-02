import { Button, Form, Modal, Select } from "antd";
import { useRouter } from "next/router";
import React from "react";

const ModalUsulan = ({ open, handleCancel }) => {
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async () => {
    const values = await form.validateFields();
    const { submission_id } = values;
    router.push(`/submissions/detail/${submission_id}/references`);
  };

  return (
    <Modal
      title="Daftar Usulan"
      width={800}
      open={open}
      onOk={onFinish}
      onCancel={handleCancel}
      centered
    >
      <Form form={form}>
        <Form.Item name="submission_id">
          <Select>
            <Select.Option value="1">Pengajuan Usulan</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

function BuatUsulan() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button onClick={handleOpen}>Buat Usulan</Button>
      <ModalUsulan open={open} handleCancel={handleClose} />
    </>
  );
}

export default BuatUsulan;

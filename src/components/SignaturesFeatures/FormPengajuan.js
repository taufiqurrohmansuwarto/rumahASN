import React from "react";
import { Form, Button, Input } from "antd";

function FormPengajuan() {
  const [form] = Form.useForm();

  const onFinish = async () => {
    const result = await form.validateFields();
    const formData = new FormData();
    formData.append("nama_dokumen", result.nama_dokumen);
  };

  //   form terdiri dari nama, jabatan, unit kerja, dan alasan pengajuan
  return (
    <Form onFinish={onFinish} form={form}>
      <Form.Item label="Nama Dokumen" name="nama_dokumen">
        <Input />
      </Form.Item>
      <Form.Item label="Nomer" name="nomer">
        <Input />
      </Form.Item>
      <Form.Item>
        <Button>Submit</Button>
      </Form.Item>
    </Form>
  );
}

export default FormPengajuan;

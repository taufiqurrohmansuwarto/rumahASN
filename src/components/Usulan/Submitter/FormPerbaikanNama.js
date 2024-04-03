import { Form, Input } from "antd";
import React from "react";

function FormPerbaikanNama() {
  const [form] = Form.useForm();

  return (
    <div>
      <Form form={form}>
        <Form.Item name="nipLama">
          <Input placeholder="NIP Lama" />
        </Form.Item>
        <Form.Item name="nipBaru">
          <Input placeholder="NIP Baru" />
        </Form.Item>
      </Form>
    </div>
  );
}

export default FormPerbaikanNama;

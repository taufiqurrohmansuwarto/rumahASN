import { Form } from "antd";
import React from "react";

function FormPerbaikanNama() {
  const [form] = Form.useForm();

  return (
    <div>
      <Form form={form}></Form>
    </div>
  );
}

export default FormPerbaikanNama;

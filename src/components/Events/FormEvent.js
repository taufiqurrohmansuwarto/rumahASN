import { DatePicker, Form, Input, Button } from "antd";
import React, { useEffect } from "react";
const format = "DD-MM-YYYY";

function FormEvent({ mode, initialValue }) {
  const [form] = Form.useForm();
  const handleSubmit = (e) => {
    if (mode === "create") {
    }
    if (mode === "edit") {
    }
  };

  useEffect(() => {
    if (mode === "edit") {
      form.setFieldsValue(initialValue);
    }
  }, [form, initialValue, mode]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="kode_event">
        <Input />
      </Form.Item>
      <Form.Item name="title">
        <Input />
      </Form.Item>
      <Form.Item name="description">
        <Input />
      </Form.Item>
      <Form.Item name="location">
        <Input />
      </Form.Item>
      <Form.Item name="date">
        <DatePicker.RangePicker format={format} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

export default FormEvent;

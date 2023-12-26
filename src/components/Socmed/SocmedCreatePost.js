import { createPost } from "@/services/socmed.services";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input } from "antd";
import React from "react";

function SocmedCreatePost() {
  const [form] = Form.useForm();
  const { mutate: create, isLoading } = useMutation(
    (data) => createPost(data),
    {
      onSuccess: () => {
        form.resetFields();
      },
      onError: (error) => {
        alert(error.message);
      },
    }
  );

  const handleFinish = (values) => {
    create(values);
  };

  return (
    <Form form={form} onFinish={handleFinish}>
      <Form.Item name="content">
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item>
        <Button loading={isLoading} disabled={isLoading} htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

export default SocmedCreatePost;

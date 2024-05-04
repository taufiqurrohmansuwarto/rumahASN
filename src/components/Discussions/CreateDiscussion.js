import { Form, Input } from "antd";

function CreateDiscussion() {
  const [form] = Form.useForm();

  return (
    <Form form={form} layout="vertical">
      <Form.Item label="Judul" name="title">
        <Input />
      </Form.Item>
      <Form.Item label="Sub Judul" name="subtitle">
        <Input />
      </Form.Item>
      <Form.Item label="Konten" name="content">
        <Input />
      </Form.Item>
    </Form>
  );
}

export default CreateDiscussion;

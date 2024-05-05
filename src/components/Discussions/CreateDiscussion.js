import { createDiscussion } from "@/services/asn-connect-discussions.services";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, message } from "antd";
import { useRouter } from "next/router";

function CreateDiscussion() {
  const router = useRouter();

  const [form] = Form.useForm();

  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createDiscussion(data),
    {
      onSuccess: () => {
        message.success("Discussion created successfully");
        router.push("/asn-connect/asn-discussions");
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const handleFinish = async () => {
    const payload = await form.validateFields();
    create(payload);
  };

  return (
    <Form onFinish={handleFinish} form={form} layout="vertical">
      <Form.Item label="Judul" name="title">
        <Input />
      </Form.Item>
      <Form.Item label="Sub Judul" name="subtitle">
        <Input />
      </Form.Item>
      <Form.Item label="Konten" name="content">
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item>
        <Button
          disabled={isLoadingCreate}
          type="primary"
          htmlType="submit"
          loading={isLoadingCreate}
        >
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}

export default CreateDiscussion;

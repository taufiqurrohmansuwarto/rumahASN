import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button, Form, Input, message } from "antd";
import { signPdf } from "@/services/esign.services";

const data = [
  {
    url: "https://siasn.bkd.jatimprov.go.id:9000/public/doc_1.pdf",
    name: "doc_1.pdf",
  },
  {
    url: "https://siasn.bkd.jatimprov.go.id:9000/public/doc_2.pdf",
    name: "doc_2.pdf",
  },
  {
    url: "https://siasn.bkd.jatimprov.go.id:9000/public/doc_3.pdf",
    name: "doc_3.pdf",
  },
];

const SignTest = () => {
  const queryClient = useQueryClient();

  const { mutate: sign, isLoading: isSigning } = useMutation({
    mutationFn: (values) => {
      return signPdf(values);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Failed");
    },
    onSuccess: () => {
      message.success("Success");
    },
  });

  const [form] = Form.useForm();
  const onSubmit = async () => {
    const values = await form.validateFields();
    sign(values);
  };
  return (
    <>
      <Form form={form} onFinish={onSubmit}>
        <Form.Item label="Passphrase" name="passphrase">
          <Input.Password autoComplete="off" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSigning}
            disabled={isSigning}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
      {data.map((item) => (
        <div key={item.name}>
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.name}
          </a>
        </div>
      ))}
    </>
  );
};

export default SignTest;

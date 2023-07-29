import { getRwSkp22 } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Form, Input } from "antd";

const FormSiasn = ({ data }) => {
  const [form] = Form.useForm();

  return (
    <Form form={form}>
      <Form.Item name="nip">
        <Input />
      </Form.Item>
    </Form>
  );
};

function CompareSKP22() {
  const { data, isLoading } = useQuery(["data-skp22"], () => getRwSkp22());

  return <div>{JSON.stringify(data)}</div>;
}

export default CompareSKP22;

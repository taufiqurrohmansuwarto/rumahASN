import { getRwJabatan } from "@/services/siasn-services";
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

function CompareJabatan() {
  const { data, isLoading } = useQuery(["data-jabatan"], () => getRwJabatan());

  return <div>{JSON.stringify(data)}</div>;
}

export default CompareJabatan;

import { getRwAngkakredit } from "@/services/siasn-services";
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

function CompareAngkaKredit() {
  const { data, isLoading } = useQuery(["data-angkakredit"], () =>
    getRwAngkakredit()
  );

  return <div>{JSON.stringify(data)}</div>;
}

export default CompareAngkaKredit;

import { rwAngkakreditMaster } from "@/services/master.services";
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

  const { data: dataAngkakreditMaster, isLoading: isLoadingAngkakreditMaster } =
    useQuery(["data-angkakredit-master"], () => rwAngkakreditMaster());

  return (
    <div>
      <div>{JSON.stringify(data)}</div>
      <div>{JSON.stringify(dataAngkakreditMaster)}</div>
    </div>
  );
}

export default CompareAngkaKredit;

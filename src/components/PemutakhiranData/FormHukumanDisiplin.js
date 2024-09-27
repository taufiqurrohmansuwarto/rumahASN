import { dataHukumanDisiplin } from "@/utils/client-data";
import { Form, Select } from "antd";

const FormHukumanDisiplin = ({ name, label }) => {
  const [form] = Form.useForm();

  return (
    <Form form={form}>
      <Form.Item name={name} label={label}>
        <Select>
          {dataHukumanDisiplin.map((item) => (
            <Select.Option key={item.id} value={item.id}>
              {item.nama}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  );
};

export default FormHukumanDisiplin;

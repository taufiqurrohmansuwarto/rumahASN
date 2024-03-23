import { getSubmissionReference } from "@/services/submissions.services";
import { useQuery } from "@tanstack/react-query";
import { Form, Select, TreeSelect } from "antd";

function FormKamusUsulan({ name }) {
  const { data, isLoading } = useQuery(
    ["submissions-references"],
    () => getSubmissionReference(),
    {}
  );

  return (
    <>
      {data && (
        <Form.Item name={name} label="Pilih Jenis Usulan">
          <Select showSearch optionFilterProp="name">
            {data.map((item) => (
              <Select.Option name={item?.type} key={item.id} value={item.id}>
                {item.type}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
    </>
  );
}

export default FormKamusUsulan;

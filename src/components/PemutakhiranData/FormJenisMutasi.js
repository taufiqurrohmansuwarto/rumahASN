import { refJenisMutasi, refJenisPenugasan } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Form, Select } from "antd";

function FormJenisMutasi({ name }) {
  const { data, isLoading } = useQuery(
    ["ref-jenis-mutasi"],
    () => refJenisMutasi(),
    {}
  );

  return (
    <>
      {data && (
        <Form.Item required name={name} label="Jenis Mutasi">
          <Select>
            {data?.map((item) => (
              <Select.Option key={item?.id} value={item?.id}>
                {item?.nama}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
    </>
  );
}

export default FormJenisMutasi;

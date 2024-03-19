import { refJenisPenugasan } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Form, Select } from "antd";

function FormJenisPenugasan({ name }) {
  const { data, isLoading } = useQuery(
    ["ref-jenis-penugasan"],
    () => refJenisPenugasan(),
    {}
  );

  return (
    <>
      {data && (
        <Form.Item required name={name} label="Jenis Penugasan">
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

export default FormJenisPenugasan;

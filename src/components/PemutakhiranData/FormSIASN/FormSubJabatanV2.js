import { getSubJabatanV2 } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Form, Select } from "antd";

function FormSubJabatanV2({ name, fungsionalId }) {
  const { data, isLoading } = useQuery(
    ["data-sub-jabatan-v2", fungsionalId],
    () => getSubJabatanV2(fungsionalId),
    {
      enabled: Boolean(fungsionalId),
    }
  );

  return (
    <>
      {data && data?.length ? (
        <Form.Item label="Sub Jabatan" name={name}>
          <Select
            showSearch
            placeholder="Pilih Sub Jabatan"
            loading={isLoading}
            optionFilterProp="nama"
          >
            {data?.map((item) => (
              <Select.Option nama={item.nama} key={item.id} value={item.id}>
                {item.nama}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ) : null}
    </>
  );
}

export default FormSubJabatanV2;

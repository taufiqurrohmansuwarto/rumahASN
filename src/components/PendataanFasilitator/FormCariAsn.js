import { getPegawaiByNip } from "@/services/pendataan-fasilitator.services";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Form, Select, Spin } from "antd";
import { useState } from "react";

const FormCariAsn = ({ name, label = "Cari Pegawai", help = "" }) => {
  const [nip, setNip] = useState(undefined);
  const [debounceValue] = useDebouncedValue(nip, 500);

  const { data, isLoading } = useQuery(
    ["get-pegawai", debounceValue],
    () => getPegawaiByNip(debounceValue),
    {
      enabled: Boolean(debounceValue),
    }
  );

  return (
    <>
      <Form.Item
        label={label}
        help={help}
        rules={[{ required: true }]}
        name={name}
      >
        <Select
          showSearch
          filterOption={false}
          loading={isLoading}
          notFoundContent={
            isLoading && debounceValue ? <Spin size="small" /> : null
          }
          onSearch={(value) => setNip(value)}
        >
          <Select.Option key={data?.id} value={data?.id}>
            {data?.nip_master} - {data?.nama_master}
          </Select.Option>
        </Select>
      </Form.Item>
    </>
  );
};

export default FormCariAsn;

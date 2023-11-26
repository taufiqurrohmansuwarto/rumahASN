import { dataKinerjaPns } from "@/services/siasn-services";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Form, Select, Spin } from "antd";
import { useState } from "react";

const FormCariPNSKinerja = ({ name, label = "Cari Pegawai", help = "" }) => {
  const [nip, setNip] = useState(undefined);
  const [debounceValue] = useDebouncedValue(nip, 500);

  const { data, isLoading } = useQuery(
    ["pns-kinerja", debounceValue],
    () => dataKinerjaPns(debounceValue),
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
          <Select.Option key={data?.nip_baru} value={data?.nip_baru}>
            {data?.nama} - {data?.unor_nm}
          </Select.Option>
        </Select>
      </Form.Item>
    </>
  );
};

export default FormCariPNSKinerja;

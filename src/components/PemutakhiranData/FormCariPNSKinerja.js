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
        normalize={(values) => values.replace(/\s/g, "")}
      >
        <Select
          showSearch
          filterOption={false}
          loading={isLoading}
          notFoundContent={
            isLoading && debounceValue ? <Spin size="small" /> : null
          }
          onSearch={(value) => {
            // remove space
            const cleanValue = value.replace(/\s/g, "");
            setNip(cleanValue);
          }}
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

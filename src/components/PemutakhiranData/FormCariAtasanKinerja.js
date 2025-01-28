import { atasanKinerja } from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Form, Select, Space, Spin, Typography } from "antd";
import { useState } from "react";

const FormCariAtasanKinerja = ({ name, label = "Cari Pegawai", help = "" }) => {
  const [search, setSearch] = useState(null);
  const [debounceValue] = useDebouncedValue(search, 500);

  const { data, isLoading } = useQuery(
    ["cari-pns-kinerja", debounceValue],
    () => atasanKinerja(debounceValue),
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
          placeholder="Ketik Nama Penilai"
          showSearch
          filterOption={false}
          loading={isLoading}
          notFoundContent={
            isLoading && debounceValue ? <Spin size="small" /> : null
          }
          onSearch={(value) => {
            // remove space
            setSearch(value);
          }}
        >
          {data?.map((item) => (
            <Select.Option key={item?.nip_master} value={item?.nip_master}>
              <Stack spacing={0}>
                <Typography.Text
                  style={{
                    fontSize: 9,
                  }}
                >
                  {item?.nama_master}
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: 8,
                  }}
                >
                  {item?.opd_master}
                </Typography.Text>
              </Stack>
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};

export default FormCariAtasanKinerja;

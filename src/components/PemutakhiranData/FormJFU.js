import { refJfu } from "@/services/siasn-services";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Form, Select, Spin } from "antd";
import { useState } from "react";

const FormJFU = ({ name, help, jabatan = "" }) => {
  const [jfu, setJfu] = useState(undefined);
  const [debounceValue] = useDebouncedValue(jfu, 500);

  const { data: dataJfu, isLoading: isLoadingJfu } = useQuery(
    ["data-jfu", debounceValue],
    () => refJfu(debounceValue),
    {
      enabled: Boolean(debounceValue),
    }
  );

  return (
    <>
      <Form.Item
        label={`Jabatan Fungsional Umum ${jabatan}`}
        rules={[{ required: true }]}
        name={name}
        help="Ketik nama jabatan kemudian tunggu.."
      >
        <Select
          showSearch
          filterOption={false}
          placeholder="Pilih Jabatan Fungsional"
          loading={isLoadingJfu}
          notFoundContent={
            isLoadingJfu && debounceValue ? <Spin size="small" /> : null
          }
          onSearch={(value) => setJfu(value)}
        >
          {dataJfu?.map((item) => (
            <Select.Option key={item?.id} value={item?.id}>
              {item?.nama} - {item?.cepat_kode}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};

export default FormJFU;

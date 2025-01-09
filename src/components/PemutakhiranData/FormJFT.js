import { refJft } from "@/services/siasn-services";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Form, Select, Spin } from "antd";
import { useState } from "react";

const FormJFT = ({ name, help, jabatan = "" }) => {
  const [jfu, setJfu] = useState(undefined);
  const [debounceValue] = useDebouncedValue(jfu, 500);

  const { data: dataJfu, isLoading: isLoadingJfu } = useQuery(
    ["data-jfu", debounceValue],
    () => refJft(debounceValue),
    {
      enabled: Boolean(debounceValue),
    }
  );

  return (
    <>
      <Form.Item
        label={`Jabatan Fungsional '${jabatan}'`}
        rules={[{ required: true }]}
        name={name}
        help="Ketik nama jabatan kemudian tunggu.."
      >
        <Select
          showSearch
          filterOption={false}
          placeholder="Pilih Jabatan Fungsional"
          loading={isLoadingJft}
          notFoundContent={
            isLoadingJft && debounceValue ? <Spin size="small" /> : null
          }
          onSearch={(value) => setJfu(value)}
        >
          {dataJfu?.map((item) => (
            <Select.Option key={item?.id} value={item?.id}>
              {item?.nama}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};

export default FormJFT;

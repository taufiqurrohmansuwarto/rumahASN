import { refJft, refSubJabatan } from "@/services/siasn-services";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Form, Select, Spin } from "antd";
import { useState } from "react";

const FormSubJabatan = ({ name, help }) => {
  const [subJabatan, setSubJabatan] = useState(undefined);
  const [debounceValue] = useDebouncedValue(subJabatan, 500);

  const { data: dataSubJabatan, isLoading: isLoadingSubJabatan } = useQuery(
    ["data-sub-jabatan", debounceValue],
    () => refSubJabatan(debounceValue),
    {
      enabled: Boolean(debounceValue),
    }
  );

  return (
    <>
      <Form.Item
        label={"Pilih Sub Jabatan"}
        rules={[{ required: true }]}
        name={name}
        help="Ketik nama jabatan kemudian tunggu.."
      >
        <Select
          showSearch
          filterOption={false}
          placeholder="Pilih Jabatan Fungsional Terampil"
          loading={isLoadingSubJabatan}
          notFoundContent={
            isLoadingSubJabatan && debounceValue ? <Spin size="small" /> : null
          }
          onSearch={(value) => setSubJabatan(value)}
        >
          {dataSubJabatan?.map((item) => (
            <Select.Option key={item?.id} value={item?.id}>
              {item?.nama}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};

export default FormSubJabatan;

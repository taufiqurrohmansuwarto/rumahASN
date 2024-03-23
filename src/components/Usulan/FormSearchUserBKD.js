import { getUsers } from "@/services/index";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Form, Select, Spin } from "antd";
import { useState } from "react";

const FormSearchUserBKD = ({ name, help }) => {
  const [jfu, setJfu] = useState(undefined);
  const [debounceValue] = useDebouncedValue(jfu, 500);

  const { data: dataJfu, isLoading: isLoadingJfu } = useQuery(
    ["data-users-bkd", debounceValue],
    () =>
      getUsers({
        search: debounceValue,
      }),
    {
      enabled: Boolean(debounceValue),
    }
  );

  return (
    <>
      <Form.Item
        label="Pilih Pegawai"
        rules={[{ required: true }]}
        name={name}
        help="Ketik nama pegawai kemudian tunggu"
      >
        <Select
          showSearch
          labelInValue
          filterOption={false}
          placeholder="Nama Pegawai BKD"
          loading={isLoadingJfu}
          notFoundContent={
            isLoadingJfu && debounceValue ? <Spin size="small" /> : null
          }
          onSearch={(value) => setJfu(value)}
        >
          {dataJfu?.data?.map((item) => (
            <Select.Option key={item?.custom_id} value={item?.custom_id}>
              {item?.username}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};

export default FormSearchUserBKD;

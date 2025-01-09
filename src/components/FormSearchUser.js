import { searchUser } from "@/services/index";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Form, Select, Spin } from "antd";
import { useState } from "react";

const FormSearchUser = ({ name, help }) => {
  const [user, setUser] = useState(undefined);
  const [debounceValue] = useDebouncedValue(user, 500);

  const { data: dataUser, isLoading: isLoadingUser } = useQuery(
    ["data-user", debounceValue],
    () => searchUser(debounceValue),
    {
      enabled: Boolean(debounceValue),
    }
  );

  return (
    <>
      <Form.Item
        label={`Jabatan Fungsional Umum`}
        rules={[{ required: true }]}
        name={name}
        help="Ketik nama jabatan kemudian tunggu.."
      >
        <Select
          showSearch
          filterOption={false}
          placeholder="Pilih Jabatan Fungsional"
          loading={isLoadingUser}
          notFoundContent={
            isLoadingUser && debounceValue ? <Spin size="small" /> : null
          }
          onSearch={(value) => setUser(value)}
        >
          {dataUser?.map((item) => (
            <Select.Option key={item?.custom_id} value={item?.custom_id}>
              {item?.username}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};

export default FormSearchUser;

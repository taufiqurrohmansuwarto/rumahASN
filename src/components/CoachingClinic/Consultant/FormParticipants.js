import { searchUser } from "@/services/index";
import { Alert, Stack } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Form, Select, Space, Spin, Typography } from "antd";
import { useState } from "react";

function FormParticipants({ name }) {
  const [jfu, setJfu] = useState(undefined);
  const [debounceValue] = useDebouncedValue(jfu, 500);

  const { data: dataJfu, isLoading: isLoadingJfu } = useQuery(
    ["data-participant", debounceValue],
    () => searchUser(debounceValue),
    {
      enabled: Boolean(debounceValue),
    }
  );

  return (
    <Stack>
      <Alert color="yellow" title="Perhatian">
        Peserta yang akan ditambahkan adalah peserta yang sudah masuk di Rumah
        ASN.
      </Alert>
      <Form.Item
        label={`Peserta`}
        rules={[{ required: true }]}
        name={name}
        help="Ketik nama / nip / niptt kemudian tunggu."
      >
        <Select
          showSearch
          filterOption={false}
          placeholder="Pilih satu Peserta"
          loading={isLoadingJfu}
          notFoundContent={
            isLoadingJfu && debounceValue ? <Spin size="small" /> : null
          }
          onSearch={(value) => setJfu(value)}
        >
          {dataJfu?.map((item) => (
            <Select.Option key={item?.custom_id} value={item?.custom_id}>
              <Space direction="vertical">
                <Space>
                  <Avatar size="small" src={item?.image} />
                  <Typography.Text>{item?.username}</Typography.Text>
                </Space>
                <Typography.Text type="secondary">{item?.from}</Typography.Text>
              </Space>
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Stack>
  );
}

export default FormParticipants;

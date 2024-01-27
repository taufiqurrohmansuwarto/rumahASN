import { checkUserByNip } from "@/services/esign-admin.services";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Form, Select, Space, Spin, Tag } from "antd";
import { useState } from "react";

const FormPersonalSign = ({ name, help }) => {
  const [personalSigner, setPersonalSigner] = useState(undefined);
  const [debounceValue] = useDebouncedValue(personalSigner, 500);

  const { data: dataPersonalSigner, isLoading: isLoadingPersonalSigner } =
    useQuery(
      ["personal-signer", debounceValue],
      () => checkUserByNip(debounceValue),
      {
        enabled: Boolean(debounceValue),
      }
    );

  return (
    <>
      <Form.Item
        label={`Personal Tanda Tangan Elektronik`}
        rules={[{ required: true }]}
        name={name}
        help="Ketik NIP kemudian tunggu..."
      >
        <Select
          showSearch
          filterOption={false}
          placeholder="Pilih NIP"
          loading={isLoadingPersonalSigner}
          notFoundContent={
            isLoadingPersonalSigner && debounceValue ? (
              <Spin size="small" />
            ) : null
          }
          onSearch={(value) => setPersonalSigner(value)}
        >
          {dataPersonalSigner && (
            <Select.Option
              key={dataPersonalSigner?.nip}
              value={dataPersonalSigner?.nip}
            >
              <Space>
                <Avatar src={dataPersonalSigner?.foto} size="small" />
                {dataPersonalSigner?.nama} - {dataPersonalSigner?.nip}
                <Tag color="green">Tersertifikasi TTE</Tag>
              </Space>
            </Select.Option>
          )}
        </Select>
      </Form.Item>
    </>
  );
};

export default FormPersonalSign;

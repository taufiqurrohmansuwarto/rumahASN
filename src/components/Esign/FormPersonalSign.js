import { checkUserByNip } from "@/services/esign-admin.services";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Form, Select, Space, Spin, Tag } from "antd";
import { useState } from "react";

const FormPersonalSign = ({ name, help }) => {
  const [personalSigner, setPersonalSigner] = useState(undefined);
  const [debounceValue] = useDebouncedValue(personalSigner, 700);

  const { data: dataPersonalSigner, isLoading: isLoadingPersonalSigner } =
    useQuery(
      ["personal-signer", debounceValue],
      () => checkUserByNip(debounceValue),
      {
        enabled: Boolean(debounceValue),
        refetchOnWindowFocus: false,
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

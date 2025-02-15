import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getRefJfuV2 } from "@/services/siasn-services";
import { Form, Select } from "antd";
const useRefJfuV2 = () => {
  return useQuery({
    queryKey: ["ref-jfu-v2"],
    queryFn: getRefJfuV2,
  });
};

function FormJFUV2({ name, jabatan }) {
  const { data, isLoading } = useRefJfuV2();

  return (
    <>
      {data && (
        <Form.Item label={`Jabatan Pelaksana ${jabatan}`} name={name}>
          <Select showSearch optionFilterProp="nama">
            {data?.map((item) => (
              <Select.Option
                nama={item.nama}
                kode={item.kode}
                key={item.id}
                value={item.id}
              >
                {item.nama}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
    </>
  );
}

export default FormJFUV2;

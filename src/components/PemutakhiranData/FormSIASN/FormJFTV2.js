import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getRefJftV2 } from "@/services/siasn-services";
import { Form, Select } from "antd";
const useRefJftV2 = () => {
  return useQuery({
    queryKey: ["ref-jft-v2"],
    queryFn: getRefJftV2,
  });
};

function FormJFTV2({ name, jabatan }) {
  const { data, isLoading } = useRefJftV2();

  return (
    <>
      {data && (
        <Form.Item label={`Jabatan Fungsional ${jabatan}`} name={name}>
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

export default FormJFTV2;

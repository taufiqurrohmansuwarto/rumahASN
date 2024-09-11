import { refPendidikan } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Form, Select } from "antd";

import React from "react";

function FormSiasnPendidikan() {
  const { data, isLoading } = useQuery(
    ["ref-pendidikan-siasn"],
    () => refPendidikan(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div>
      {data && (
        <Form.Item name="pendidikan_id" label="Pendidikan">
          <Select showSearch optionFilterProp="name" allowClear>
            {data?.map((item) => (
              <Select.Option name={item.name} value={item.id} key={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}
    </div>
  );
}

export default FormSiasnPendidikan;

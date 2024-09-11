import { simasterJftBackup } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import { Form, TreeSelect } from "antd";
import React from "react";

function FormSimasterJFT() {
  const { data, isLoading } = useQuery(
    ["simaster-jft"],
    () => simasterJftBackup(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      {data && (
        <Form.Item name="jft_id">
          <TreeSelect
            treeData={data}
            treeDataSimpleMode
            treeDefaultExpandAll
            placeholder="Pilih JFT"
          />
        </Form.Item>
      )}
    </>
  );
}

export default FormSimasterJFT;

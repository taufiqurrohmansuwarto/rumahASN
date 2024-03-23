import { unorASN } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import { Form, TreeSelect } from "antd";
import React from "react";

function FormUnorSIMASTER({ name }) {
  const { data, isLoading } = useQuery(["unor-simaster"], () => unorASN(), {});

  return (
    <>
      {data && (
        <Form.Item name={name} label="Pilih Wilayah PIC">
          <TreeSelect
            labelInValue
            multiple
            showSearch
            treeNodeFilterProp="title"
            treeData={data}
          />
        </Form.Item>
      )}
    </>
  );
}

export default FormUnorSIMASTER;

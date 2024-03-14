import { unorASN } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import { Form, TreeSelect } from "antd";
import React from "react";

function FormUnorASN({ name }) {
  const { data, isLoading } = useQuery(["unor-asn"], () => unorASN(), {});
  return (
    <>
      {data && (
        <Form.Item name={name} label="Pilih Unor ASN">
          <TreeSelect showSearch treeNodeFilterProp="title" treeData={data} />
        </Form.Item>
      )}
    </>
  );
}

export default FormUnorASN;

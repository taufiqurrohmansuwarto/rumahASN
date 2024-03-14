import { unorPTTPK } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import { Form, TreeSelect } from "antd";

function FormUnorPTTPK({ name }) {
  const { data, isLoading } = useQuery(["unor-pttpk"], () => unorPTTPK(), {});
  return (
    <>
      {data && (
        <Form.Item name={name} label="Pilih Unor PTTPK">
          <TreeSelect showSearch treeNodeFilterProp="title" treeData={data} />
        </Form.Item>
      )}
    </>
  );
}

export default FormUnorPTTPK;

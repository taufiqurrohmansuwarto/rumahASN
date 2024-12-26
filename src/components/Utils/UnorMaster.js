import { getOpdFasilitator } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import { Form, TreeSelect } from "antd";

function FormUnorMaster({ name, type }) {
  const { data, isLoading } = useQuery(
    ["unor-fasilitator-master"],
    () => getOpdFasilitator(),
    {}
  );

  return (
    <>
      {data && (
        <Form.Item name={name} label="Pilih Unor">
          <TreeSelect showSearch treeNodeFilterProp="title" treeData={data} />
        </Form.Item>
      )}
    </>
  );
}

export default FormUnorMaster;

import { getOpdFasilitator } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import { Form, TreeSelect } from "antd";

function FormUnorMaster({ name, type, required = false }) {
  const { data, isLoading } = useQuery(
    ["unor-fasilitator-master"],
    () => getOpdFasilitator(),
    {}
  );

  return (
    <>
      {data && (
        <Form.Item name={name} label="Pilih Unor" required={required}>
          <TreeSelect showSearch treeNodeFilterProp="title" treeData={data} />
        </Form.Item>
      )}
    </>
  );
}

export default FormUnorMaster;

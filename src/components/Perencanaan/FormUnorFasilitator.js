import { useQuery } from "@tanstack/react-query";
import { getOpdFasilitator } from "@/services/master.services";
import { Form, TreeSelect } from "antd";

function FormUnorFasilitator({ name }) {
  const { data: unor } = useQuery(
    ["unor-fasilitator"],
    () => getOpdFasilitator(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      {unor && (
        <Form.Item name={name} label="Perangkat Daerah">
          <TreeSelect treeNodeFilterProp="label" treeData={unor} showSearch />
        </Form.Item>
      )}
    </>
  );
}

export default FormUnorFasilitator;

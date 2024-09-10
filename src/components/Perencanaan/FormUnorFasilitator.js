import { useQuery } from "@tanstack/react-query";
import { getOpdFasilitator } from "@/services/master.services";
import { Form, TreeSelect } from "antd";

function FormUnorFasilitator() {
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
        <Form.Item name="skpd_id" label="Perangkat Daerah">
          <TreeSelect treeNodeFilterProp="label" treeData={unor} showSearch />
        </Form.Item>
      )}
    </>
  );
}

export default FormUnorFasilitator;

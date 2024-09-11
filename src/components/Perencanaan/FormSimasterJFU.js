import { simasterJfuBackup } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import { Form, TreeSelect } from "antd";

function FormSimasterJFU({ name }) {
  const { data, isLoading } = useQuery(
    ["simaster-jfu"],
    () => simasterJfuBackup(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      {data && (
        <Form.Item label="Jabatan Pelaksana" name={name}>
          <TreeSelect treeNodeFilterProp="label" showSearch treeData={data} />
        </Form.Item>
      )}
    </>
  );
}

export default FormSimasterJFU;

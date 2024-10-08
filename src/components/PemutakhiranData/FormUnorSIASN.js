import { unitOrganisasi } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Form, TreeSelect } from "antd";

const FormUnorSIASN = ({ name, unor }) => {
  const { data: tree, isLoading: isLoadingTree } = useQuery(
    ["ref-unor-new"],
    () => unitOrganisasi(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      {tree && (
        <>
          <Form.Item
            label={`Unit Organisasi ${unor}`}
            rules={[{ required: true }]}
            name={name}
            help="Pilih Unit Organisasi terkecil dan untuk SMA/SMK gunakan UPT terlebih dahulu"
          >
            <TreeSelect treeNodeFilterProp="label" treeData={tree} showSearch />
          </Form.Item>
        </>
      )}
    </>
  );
};

export default FormUnorSIASN;

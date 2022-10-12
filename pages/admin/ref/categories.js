import { useQuery } from "@tanstack/react-query";
import { Input, Form, TreeSelect } from "antd";
import { getCategories, getTreeOrganization } from "../../../services";

const { default: AdminLayout } = require("../../../src/components/AdminLayout");
const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const CreateForm = () => {
  const [form] = Form.useForm();
  return (
    <Form form={form}>
      <Form.Item
        label="Nama"
        name="name"
        rules={[{ required: true, message: "Nama tidak boleh kosong" }]}
      >
        <Input />
      </Form.Item>
      <FormTree />
      <Form.Item label="Description" name="description">
        <Input.TextArea />
      </Form.Item>
    </Form>
  );
};

// create form component for data tree
const FormTree = () => {
  const { data: dataTree, isLoading: isLoadingDataTree } = useQuery(
    ["organization-tree"],
    () => getTreeOrganization()
  );
  return (
    <>
      {dataTree && (
        <>
          <Form.Item
            label="Struktur Organisasi"
            name="organization_id"
            rules={[
              {
                required: true,
                message: "Struktur Organisasi tidak boleh kosong",
              },
            ]}
          >
            <TreeSelect
              treeNodeFilterProp="label"
              treeData={dataTree}
              showSearch
              placeholder="Pilih Struktur Organisasi"
              treeDefaultExpandAll
            />
          </Form.Item>
        </>
      )}
    </>
  );
};

const Categories = () => {
  const { data, isLoading } = useQuery(["categories"], () => getCategories());

  return (
    <PageContainer>
      <CreateForm />
    </PageContainer>
  );
};

Categories.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

Categories.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Categories;

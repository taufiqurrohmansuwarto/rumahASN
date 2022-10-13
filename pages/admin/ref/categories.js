import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Input,
  Form,
  TreeSelect,
  Modal,
  Button,
  Table,
  Space,
  Divider,
  Popconfirm,
} from "antd";
import { useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getTreeOrganization,
} from "../../../services";

const { default: AdminLayout } = require("../../../src/components/AdminLayout");
const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

// create random generate color
const randomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

const CreateForm = ({ open, handleCancel }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { mutate: add, isLoading: confirmLoading } = useMutation(
    (data) => createCategory(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["categories"]);
        handleCancel();
      },
      onError: (error) => {
        console.error(error);
      },
    }
  );

  const handleOk = async () => {
    try {
      const result = await form.validateFields();
      const data = {
        description: result.description,
        name: result?.name,
        kode_satuan_kerja: result?.organization?.value,
        satuan_kerja: result?.organization,
        color: randomColor(),
      };

      add(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      onOk={handleOk}
      confirmLoading={confirmLoading}
      centered
      width={800}
      open={open}
      onCancel={handleCancel}
    >
      <Form layout="vertical" form={form}>
        <FormTree />
        <Form.Item
          label="Nama"
          name="name"
          rules={[{ required: true, message: "Nama tidak boleh kosong" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Deskripsi" name="description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
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
            name="organization"
            rules={[
              {
                required: true,
                message: "Struktur Organisasi tidak boleh kosong",
              },
            ]}
          >
            <TreeSelect
              labelInValue
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
  const [createModal, setCreateModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);

  const openCreateModal = () => setCreateModal(true);
  const openUpdateModal = () => setUpdateModal(true);
  const handleCancelCreateModal = () => setCreateModal(false);
  const handleCancelUpdateModal = () => setUpdateModal(false);

  const queryClient = useQueryClient();
  const { mutate: hapus } = useMutation((id) => deleteCategory(id), {
    onSettled: () => {
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleDelete = (id) => {
    hapus(id);
  };

  const columns = [
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Bidang/Perangkat Daerah",
      key: "satuan_kerja",
      render: (text, record) => {
        return record.satuan_kerja.label;
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (text, record) => (
        <Space>
          <a onClick={openUpdateModal}>Edit</a>
          <Divider type="vertical" />
          <Popconfirm title="Apakah anda ingin menghapus data?">
            <a onClick={() => handleDelete(record?.id)}>Hapus</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <Button onClick={openCreateModal}>Create</Button>
      <Table
        columns={columns}
        pagination={false}
        rowKey={(row) => row?.id}
        dataSource={data}
        loading={isLoading}
      />
      <CreateForm open={createModal} handleCancel={handleCancelCreateModal} />
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

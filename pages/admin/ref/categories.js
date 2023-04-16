import { PlusOutlined } from "@ant-design/icons";
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
  Card,
  message,
  Alert,
} from "antd";
import { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getTreeOrganization,
  updateCategory,
} from "../../../services";
import { formatDateLL } from "@/utils/client-utils";
import { Stack } from "@mantine/core";

const { default: AdminLayout } = require("../../../src/components/AdminLayout");
const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

// create random generate color
const randomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

const UpdateForm = ({ open, onCancel, data }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { mutate: update } = useMutation((data) => updateCategory(data), {
    onSettled: () => {
      queryClient.invalidateQueries(["categories"]);
      onCancel();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleOk = async () => {
    try {
      const result = await form.validateFields();

      const send = {
        id: data?.id,
        data: {
          satuan_kerja: result?.organization,
          name: result?.name,
          kode_satuan_kerja: result?.organization?.value,
          description: result?.description,
        },
      };
      update(send);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      ...data,
      organization: data?.satuan_kerja,
    });
  }, [data, form]);

  return (
    <Modal
      onOk={handleOk}
      width={700}
      title="Update Kategori"
      open={open}
      destroyOnClose
      onCancel={onCancel}
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="name" label="Nama">
          <Input />
        </Form.Item>
        <FormTree />
        <Form.Item name="description" lable="Deskripsi">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
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
      title="Tambah Kategori"
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
  const handleCancelCreateModal = () => setCreateModal(false);
  const handleCancelUpdateModal = () => setUpdateModal(false);

  const [dataUpdate, setDataUpdate] = useState(null);

  const openUpdateModal = (data) => {
    setUpdateModal(true);
    setDataUpdate(data);
  };

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
      title: "Tgl. Dibuat",
      key: "created_at",
      render: (text, record) => <div>{formatDateLL(record.created_at)}</div>,
    },
    {
      title: "Pembuat",
      key: "created_by",
      render: (text, record) => {
        return record?.createdBy?.username;
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (text, record) => (
        <Space>
          <a
            onClick={() => {
              openUpdateModal(record);
            }}
          >
            Edit
          </a>
          <Divider type="vertical" />
          <Popconfirm
            onConfirm={() => handleDelete(record?.id)}
            title="Apakah anda ingin menghapus data?"
          >
            <a>Hapus</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Kategori Pertanyaan">
      <Stack>
        <Alert
          message="Kategori"
          showIcon
          type="info"
          description='Kategori adalah kelompok umum yang mencakup berbagai topik atau isu terkait dengan bidang kepegawaian. Kategori membantu memisahkan pertanyaan atau masalah ke dalam area spesifik yang lebih mudah dikelola. Contoh, kategori adalah "Seleksi CASN" yang mencakup semua pertanyaan dan masalah yang terkait dengan seleksi Calon Aparatur Sipil Negara.'
        />
        <Card>
          <Button
            style={{ marginBottom: 16 }}
            icon={<PlusOutlined />}
            type="primary"
            onClick={openCreateModal}
          >
            Tambah
          </Button>
          <Table
            columns={columns}
            pagination={false}
            rowKey={(row) => row?.id}
            dataSource={data}
            loading={isLoading}
          />
          <CreateForm
            open={createModal}
            handleCancel={handleCancelCreateModal}
          />
          <UpdateForm
            open={updateModal}
            data={dataUpdate}
            onCancel={handleCancelUpdateModal}
          />
        </Card>
      </Stack>
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

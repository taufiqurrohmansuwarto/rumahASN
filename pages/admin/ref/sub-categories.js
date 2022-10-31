import { FileAddOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
} from "antd";
import { useEffect, useState } from "react";
import {
  createPriority,
  deletePriority,
  getCategories,
  getPriorities,
  subCategories,
  updatePriority,
} from "../../../services";

const { default: AdminLayout } = require("../../../src/components/AdminLayout");
const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const UpdateForm = ({ open, onCancel, data, update, loading }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const value = await form.validateFields();
    const patchData = {
      id: data?.id,
      data: { name: value.name, color: value.color },
    };
    update(patchData);
  };

  useEffect(() => {
    form.setFieldsValue({
      name: data?.name,
      color: data?.color,
    });
  }, [form, data]);

  return (
    <Modal
      centered
      onOk={handleOk}
      title="Update data"
      confirmLoading={loading}
      open={open}
      onCancel={onCancel}
    >
      <Form form={form}>
        <Form.Item name="name" label="Nama">
          <Input />
        </Form.Item>
        <Form.Item name="color" label="Color">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const CreateForm = ({ open, onCancel, categories }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { mutate: create } = useMutation((data) => createPriority(data), {
    onSettled: () => {
      queryClient.invalidateQueries(["priorities"]);
      onCancel();
    },
  });

  const handleOk = async () => {
    try {
      const result = await form.validateFields();
      create(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal
      onOk={handleOk}
      centered
      title="Buat Sub Kategori"
      destroyOnClose
      width={600}
      open={open}
      onCancel={onCancel}
    >
      <Form form={form}>
        <Form.Item
          rules={[{ required: true, message: "Nama tidak boleh kosogn" }]}
          name="name"
          label="Name"
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "Warna tidak boleh kosong" }]}
          name="category_id"
          label="Kategori"
        >
          <Select showSearch optionFilterProp="name">
            {categories.map((category) => (
              <Select.Option
                key={category?.id}
                name={category?.name}
                value={category.id}
              >
                {category.name} - {category?.satuan_kerja?.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const SubCategories = () => {
  const { data, isLoading } = useQuery(["sub-categories"], () =>
    subCategories()
  );

  const { data: dataCategories, isLoading: isLoadingCategory } = useQuery(
    ["categories"],
    () => getCategories()
  );

  // wow fucking amazing
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const cancelCreate = () => setOpenCreate(false);
  const cancelUpdate = () => setOpenUpdate(false);

  const openCreateModal = () => {
    setOpenCreate(true);
  };

  const openUpdateModal = (data) => {
    setSelectedData(data);
    setOpenUpdate(true);
  };

  const { mutate: update, isLoading: updateLoading } = useMutation(
    (data) => updatePriority(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["priorities"]);
      },
      onSuccess: () => {
        message.success("Berhasil mengupdate data");
        cancelUpdate();
      },
      onError: (err) => {
        message.error("Gagal mengupdate data");
      },
    }
  );

  const queryClient = useQueryClient();

  const { mutate: hapus } = useMutation((id) => deletePriority(id), {
    onSettled: () => {
      queryClient.invalidateQueries(["priorities"]);
      message.success("Berhasil menghapus data");
    },
    onError: (error) => {
      message.error(JSON.stringify(error));
    },
  });

  const handleHapus = (id) => {
    hapus(id);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Kategori",
      key: "Kategori",
      render: (data) => data.category.name,
    },
    {
      title: "Satuan Kerja",
      key: "satuan_kerja",
      render: (data) => data.category.satuan_kerja.label,
    },
    {
      title: "Di buat oleh",
      key: "created_by",
      render: (text, record) => {
        return record.createdBy?.username;
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (text, record) => {
        return (
          <Space>
            <a onClick={() => openUpdateModal(record)}>Update</a>
            <Divider type="vertical" />
            <Popconfirm
              onConfirm={() => handleHapus(record?.id)}
              title="Apakah anda yakin ingin menghapus?"
            >
              <a>Hapus</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <Card>
        <Button
          type="primary"
          icon={<FileAddOutlined />}
          onClick={openCreateModal}
          style={{ marginBottom: 16 }}
        >
          Tambah
        </Button>
        <Table
          columns={columns}
          pagination={false}
          dataSource={data}
          rowKey={(row) => row?.id}
          loading={isLoading}
        />
        <CreateForm
          open={openCreate}
          categories={dataCategories}
          onCancel={cancelCreate}
        />
        <UpdateForm
          open={openUpdate}
          data={selectedData}
          update={update}
          onCancel={cancelUpdate}
          loading={updateLoading}
        />
      </Card>
    </PageContainer>
  );
};

SubCategories.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

SubCategories.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default SubCategories;

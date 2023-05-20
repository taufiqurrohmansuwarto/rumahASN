import Layout from "@/components/Layout";
import Head from "next/head";

import {
  createSubCategory,
  deleteSubCategory,
  getCategories,
  subCategories,
  updateSubCategory,
} from "@/services/index";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  message,
} from "antd";
import { useEffect, useState } from "react";

const { default: PageContainer } = require("@/components/PageContainer");

const UpdateForm = ({ open, onCancel, data, update, loading, categories }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const value = await form.validateFields();
    const patchData = {
      id: data?.id,
      data: {
        name: value.name,
        category_id: value.category_id,
        description: value.description,
        durasi: value.durasi,
      },
    };
    update(patchData);
  };

  useEffect(() => {
    form.setFieldsValue({
      name: data?.name,
      category_id: data?.category_id,
      description: data?.description,
      durasi: data?.durasi,
    });
  }, [form, data]);

  return (
    <Modal
      centered
      onOk={handleOk}
      width={800}
      title="Update Sub Kategori"
      confirmLoading={loading}
      open={open}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Nama"
          rules={[
            {
              required: true,
              message: "Nama Tidak boleh kosong",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Durasi Penyelesaian (Dalam Menit)"
          name="durasi"
          rules={[{ required: true, message: "Durasi tidak boleh kosong" }]}
          initialValue={0}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "Kategori tidak boleh kosong" }]}
          name="category_id"
          label="Kategori"
        >
          <Select showSearch optionFilterProp="name">
            {categories?.map((category) => (
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
        <Form.Item label="Deskripsi" name="description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const CreateForm = ({ open, onCancel, categories }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { mutate: create, isLoading } = useMutation(
    (data) => createSubCategory(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["sub-categories"]);
        message.success("Berhasil membuat sub kategori");
        form.resetFields();
        onCancel();
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

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
      confirmLoading={isLoading}
      centered
      title="Buat Sub Kategori"
      destroyOnClose
      width={600}
      open={open}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          rules={[{ required: true, message: "Nama tidak boleh kosong" }]}
          name="name"
          label="Nama Sub Kategori"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Durasi Penyelesaian (Dalam Menit)"
          name="durasi"
          rules={[{ required: true, message: "Durasi tidak boleh kosong" }]}
          initialValue={0}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "Kategori tidak boleh kosong" }]}
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
        <Form.Item label="Deskripsi" name="description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function ReferensiSubCategories() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 20,
    search: "",
  });

  const { data, isLoading } = useQuery(
    ["sub-categories", query],
    () => subCategories(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const { data: dataCategories, isLoading: isLoadingCategory } = useQuery(
    ["categories"],
    () => getCategories({ limit: -1 }),
    {
      refetchOnWindowFocus: false,
    }
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
    (data) => updateSubCategory(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["sub-categories"]);
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

  const { mutate: hapus } = useMutation((id) => deleteSubCategory(id), {
    onSettled: () => {
      queryClient.invalidateQueries(["sub-categories"]);
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
      title: "Nama",
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
      title: "Durasi Penyelesaian",
      key: "durasi",
      render: (data) =>
        data?.durasi === null ? "0 Menit" : `${data?.durasi} Menit`,
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

  const handleSearch = (e) => {
    setQuery({
      ...query,
      search: e,
      page: 1,
      limit: 10,
    });
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Referensi - Sub Categories</title>
      </Head>
      <PageContainer title="Kamus Referensi" subTitle="Sub Kategori Pertanyaan">
        <Table
          title={() => (
            <>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
                style={{ marginBottom: 16, marginTop: 16 }}
              >
                Sub Kategori Pertanyaan
              </Button>
              <Input.Search
                onSearch={handleSearch}
                placeholder="Cari Sub Kategori"
              />
            </>
          )}
          columns={columns}
          pagination={{
            pageSize: query.limit,
            total: data?.total,
            showTotal: (total) => `Total ${total} item`,
            position: ["topRight", "bottomRight"],
            current: query.page,
            onChange: (page, pageSize) => {
              setQuery({
                ...query,
                page,
                limit: pageSize,
              });
            },
          }}
          dataSource={data?.data}
          rowKey={(row) => row?.id}
          loading={isLoading}
        />
        <CreateForm
          open={openCreate}
          categories={dataCategories}
          onCancel={cancelCreate}
        />
        <UpdateForm
          categories={dataCategories}
          open={openUpdate}
          data={selectedData}
          update={update}
          onCancel={cancelUpdate}
          loading={updateLoading}
        />
      </PageContainer>
    </>
  );
}

ReferensiSubCategories.getLayout = function getLayout(page) {
  return <Layout active="/referensi/sub-categories">{page}</Layout>;
};

ReferensiSubCategories.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default ReferensiSubCategories;

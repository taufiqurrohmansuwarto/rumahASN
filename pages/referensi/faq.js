import Layout from "@/components/Layout";
import Head from "next/head";

import { PlusOutlined } from "@ant-design/icons";
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
  Space,
  Table,
} from "antd";
import { useEffect, useState } from "react";
import { createFaq, deleteFaq, getFaqs, updateFaq } from "@/services/index";
import { formatDate } from "@/utils/index";

const { default: PageContainer } = require("@/components/PageContainer");

const UpdateForm = ({ open, onCancel, data }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  useEffect(() => {
    form.setFieldsValue({
      name: data?.name,
      description: data?.description,
    });
  }, [data, form]);

  const { mutate: update } = useMutation((data) => updateFaq(data), {
    onSettled: () => {
      queryClient.invalidateQueries(["faqs"]);
      onCancel();
    },
    onError: (error) => {
      console.log(error);
    },
    onSuccess: () => {
      message.success("Berhasil mengubah FAQ");
    },
  });

  const handleOk = async () => {
    try {
      const { name, description } = await form.validateFields();
      const send = {
        id: data?.id,
        data: {
          name,
          description,
        },
      };
      update(send);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      onOk={handleOk}
      centered
      width={700}
      title="Edit Pertanyaan Umum"
      destroyOnClose
      open={open}
      onCancel={onCancel}
    >
      <Form
        initialValues={{
          name: data?.name,
          description: data?.description,
        }}
        layout="vertical"
        form={form}
      >
        <Form.Item name="name" label="Nama">
          <Input />
        </Form.Item>
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
    (data) => createFaq(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["faqs"]);
        handleCancel();
      },
      onSuccess: () => {
        message.success("Berhasil menambahkan FAQ");
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
      };

      add(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      destroyOnClose
      onOk={handleOk}
      confirmLoading={confirmLoading}
      centered
      title="Tambah Pertanyaan Umum"
      width={800}
      open={open}
      onCancel={handleCancel}
    >
      <Form layout="vertical" form={form}>
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

function ReferensiFaq() {
  const { data, isLoading } = useQuery(["faqs"], () => getFaqs());
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
  const { mutate: hapus } = useMutation((id) => deleteFaq(id), {
    onSettled: () => {
      message.success("Berhasil menghapus FAQ");
      queryClient.invalidateQueries(["faqs"]);
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
      title: "Tgl. dibuat",
      key: "created_at",
      render: (_, row) => formatDate(row.created_at),
    },
    {
      title: "Dibuat oleh",
      key: "created_by",
      render: (_, record) => {
        return record?.created_by?.username;
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
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
            Hapus
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Rumah ASN - Referensi - Pertanyaan Umum</title>
      </Head>
      <PageContainer title="Kamus Referensi" subTitle="Daftar Pertanyaan Umum">
        <Card>
          <Button
            style={{ marginBottom: 16 }}
            icon={<PlusOutlined />}
            type="primary"
            onClick={openCreateModal}
          >
            Pertanyaan Umum
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
      </PageContainer>
    </>
  );
}

ReferensiFaq.getLayout = function getLayout(page) {
  return <Layout active="/referensi/faq">{page}</Layout>;
};

ReferensiFaq.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default ReferensiFaq;

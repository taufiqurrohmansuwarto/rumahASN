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
import {
  createStatus,
  deleteStatus,
  getStatus,
  updateStatus,
} from "@/services/index";

const { default: PageContainer } = require("@/components/PageContainer");

const CreateStatus = ({ open, onCancel }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const createMutation = useMutation((data) => createStatus(data), {
    onSettled: () => {
      queryClient.invalidateQueries(["status"]);
    },
    onSuccess: () => {
      message.success("Berhasil membuat status");
      onCancel();
    },
  });

  const onFinish = async () => {
    try {
      const result = await form.validateFields();
      createMutation.mutate(result);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      destroyOnClose
      onOk={onFinish}
      centered
      title="Buat Referensi Status"
      open={open}
      onCancel={onCancel}
    >
      <Form form={form}>
        <Form.Item
          label="Nama"
          name="name"
          rules={[{ required: true, message: "Nama tidak boleh kosong" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
const UpdateStatus = ({ open, onCancel, data }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { mutate: update, isLoading } = useMutation(
    (data) => updateStatus(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["status"]);
      },
      onSuccess: () => {
        message.success("Berhasil mengubah status");
        onCancel();
      },
    }
  );

  const handleUpdate = async () => {
    try {
      const result = await form.validateFields();
      const dataSend = { id: data?.id, data: { name: result?.name } };
      update(dataSend);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    form.setFieldsValue({ name: data?.name });
  }, [data, form]);

  return (
    <Modal
      onOk={handleUpdate}
      confirmLoading={isLoading}
      title="Update Data"
      open={open}
      onCancel={onCancel}
    >
      <Form form={form} initialValues={data}>
        <Form.Item name="name">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function ReferensiStatus() {
  const { data, isLoading } = useQuery(["status"], () => getStatus());
  const [visibleCreate, setVisibleCreate] = useState(false);
  const [visibleUpdate, setVisibileUpdate] = useState(false);
  const [dataUpdate, setDataUpdate] = useState(null);

  const client = useQueryClient();

  const handleCreateOpen = () => {
    setVisibleCreate(true);
  };

  const onCancelCreate = () => {
    setVisibleCreate(false);
  };

  const onCancelUpdate = () => {
    setVisibileUpdate(false);
  };

  const { mutate: hapus } = useMutation((id) => deleteStatus(id), {
    onSettled: () => {
      client.invalidateQueries(["status"]);
    },
    onSuccess: () => {
      message.success("Berhasil menghapus status");
    },
  });

  const handleHapus = (id) => {
    hapus(id);
  };

  const columns = [
    {
      title: "Nama",
      key: "name",
      dataIndex: "name",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              setDataUpdate(record);
              setVisibileUpdate(true);
            }}
          >
            Ubah
          </a>
          <Divider type="vertical" />
          <Popconfirm
            title="Apakah anda yakin ingin menghapus"
            onConfirm={() => handleHapus(record?.id)}
          >
            <a>Hapus</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Rumah ASN - Referensi - Status</title>
      </Head>
      <PageContainer title="Kamus Referensi" subTitle="Status Pertanyaan">
        <Card>
          <Button
            style={{ marginBottom: 16 }}
            onClick={handleCreateOpen}
            type="primary"
            icon={<PlusOutlined />}
          >
            Buat
          </Button>
          <Table
            loading={isLoading}
            dataSource={data}
            columns={columns}
            rowKey={(row) => row?.id}
            pagination={false}
          />
          <CreateStatus onCancel={onCancelCreate} open={visibleCreate} />
          <UpdateStatus
            open={visibleUpdate}
            data={dataUpdate}
            onCancel={onCancelUpdate}
          />
        </Card>
      </PageContainer>
    </>
  );
}

ReferensiStatus.getLayout = function getLayout(page) {
  return <Layout active="/referensi/status">{page}</Layout>;
};

ReferensiStatus.Auth = {
  action: "manage",
  subject: "Dashboard",
};

export default ReferensiStatus;

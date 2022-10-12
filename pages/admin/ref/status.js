import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
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
} from "../../../services";

const { default: AdminLayout } = require("../../../src/components/AdminLayout");
const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

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
      onsSettled: () => {
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
      const data = { id: data?.id, name: result?.name };
      update(data);
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

const Status = () => {
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
      render: (text, record) => (
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
    <PageContainer>
      <Button onClick={handleCreateOpen}>Buat</Button>
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
    </PageContainer>
  );
};

Status.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

Status.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Status;

import {
  createUsulan,
  deleteUsulan,
  findUsulan,
  updateUsulan,
} from "@/services/perencanaan.services";
import { FileAddOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ModalForm = ({
  loading,
  open,
  onClose,
  type,
  currentData,
  create,
  update,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (type === "update") {
      form.setFieldsValue(currentData);
    }
  }, [type, currentData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (type === "create") {
        create(values);
      } else {
        const payload = {
          id: currentData.id,
          data: values,
        };
        update(payload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={type === "create" ? "Buat Usulan" : "Edit Usulan"}
      confirmLoading={loading}
      onOk={handleSubmit}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          rules={[{ required: true, message: "Judul harus diisi" }]}
          name="judul"
          label="Judul"
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "Deskripsi harus diisi" }]}
          name="deskripsi"
          label="Deskripsi"
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: "Tahun harus diisi" }]}
          name="tahun"
          label="Tahun"
        >
          <InputNumber />
        </Form.Item>
        {type === "update" && (
          <Form.Item name="is_active" label="Status">
            <Switch />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

function UsulanPerencanaan() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("create");
  const [currentData, setCurrentData] = useState(null);

  const queryClient = useQueryClient();

  const handleOpenCreate = () => {
    setType("create");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentData(null);
  };

  const { data, isLoading } = useQuery(
    ["usulan-perencanaan"],
    () => findUsulan(),
    {}
  );

  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createUsulan(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["usulan-perencanaan"]);
        handleClose();
      },
      onError: () => {
        message.error("Gagal membuat usulan");
      },
    }
  );

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateUsulan(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["usulan-perencanaan"]);
        handleClose();
        message.success("Berhasil mengubah usulan");
      },
      onError: () => {
        message.error("Gagal mengubah usulan");
      },
    }
  );

  const { mutateAsync: remove, isLoading: isLoadingRemove } = useMutation(
    (id) => deleteUsulan(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["usulan-perencanaan"]);
        message.success("Berhasil menghapus usulan");
        handleClose();
      },
      onError: () => {
        message.error("Gagal menghapus usulan");
      },
    }
  );

  const handleRemove = async (id) => {
    await remove(id);
  };

  const handleDetail = (id) => {
    router.push(`/apps-managements/perencanaan/usulan/${id}/detail`);
  };

  const handleUpdate = (data) => {
    setType("update");
    setCurrentData(data);
    setOpen(true);
  };

  const columns = [
    {
      title: "Judul",
      dataIndex: "judul",
    },
    {
      title: "Deskripsi",
      dataIndex: "deskripsi",
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      render: (text) => (text ? "Aktif" : "Tidak Aktif"),
    },
    {
      title: "Dibuat oleh",
      key: "user_id",
      render: (text, record) => record?.user?.username,
    },
    {
      title: "Dibuat pada",
      key: "created_at",
      render: (text, record) =>
        dayjs(record.created_at).format("DD MMM YYYY HH:mm:ss"),
    },
    {
      title: "Diperbaharui pada",
      key: "updated_at",
      render: (text, record) =>
        dayjs(record.updated_at).format("DD MMM YYYY HH:mm:ss"),
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (text, record) => (
        <Space direction="horizontal">
          <a onClick={() => handleDetail(record.id)}>Detail</a>
          <Divider type="vertical" />
          <a onClick={() => handleUpdate(record)}>Edit</a>
          <Divider type="vertical" />
          <Popconfirm
            title="Apakah anda yakin ingin menghapus usulan ini?"
            onConfirm={() => handleRemove(record.id)}
          >
            <a>Hapus</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Button
        style={{ marginBottom: 16 }}
        type="primary"
        icon={<FileAddOutlined />}
        onClick={handleOpenCreate}
      >
        Buat Usulan
      </Button>
      <Table
        pagination={false}
        columns={columns}
        dataSource={data}
        loading={isLoading}
      />
      <ModalForm
        open={open}
        onClose={handleClose}
        type={type}
        currentData={currentData}
        create={create}
        update={update}
        loading={isLoadingCreate || isLoadingUpdate}
      />
    </Card>
  );
}

export default UsulanPerencanaan;

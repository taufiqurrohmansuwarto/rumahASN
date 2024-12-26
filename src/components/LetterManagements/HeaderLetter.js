import {
  createHeaderSurat,
  deleteHeaderSurat,
  updateHeaderSurat,
  getHeaderSurat,
} from "@/services/letter-managements.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Table, Modal, Form, Input, message } from "antd";
import { useState, useEffect } from "react";

// Modal component for creating/updating headers
const HeaderModal = ({
  open,
  onClose,
  data,
  onSubmit,
  isLoading,
  type = "create",
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (type === "update") {
      form.setFieldsValue(data);
    }
  }, [data, type, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Modal
      confirmLoading={isLoading}
      onOk={handleSubmit}
      open={open}
      onCancel={onClose}
      title={type === "create" ? "Tambah Header" : "Edit Header"}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nama Instansi / Perangkat Daerah"
          name="nama_instansi"
          rules={[{ required: true, message: "Nama instansi harus diisi" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Nama Perangkat Daerah"
          name="nama_perangkat_daerah"
          rules={[
            { required: true, message: "Nama perangkat daerah harus diisi" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Alamat"
          name="alamat"
          rules={[{ required: true, message: "Alamat harus diisi" }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          label="Telepon"
          name="telepon"
          // contoh format (031) 8477551
          rules={[{ required: true, message: "Telepon harus diisi" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Laman Web"
          name="laman_web"
          rules={[
            { required: true, message: "Laman web harus diisi" },
            {
              pattern: /^(https?:\/\/)?[^\s/$.?#].[^\s]*$/,
              message: "Laman web harus berupa URL yang valid",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Email harus diisi" },
            { type: "email", message: "Email tidak valid" },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const HeaderLetter = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "create",
    data: null,
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: headers, isLoading: isLoadingHeaders } = useQuery(
    ["header-surat"],
    getHeaderSurat
  );

  // Mutations
  const { mutateAsync: createHeader, isLoading: isCreating } = useMutation(
    createHeaderSurat,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["header-surat"]);
        message.success("Header berhasil dibuat");
        handleCloseModal();
      },
    }
  );

  const { mutateAsync: updateHeader, isLoading: isUpdating } = useMutation(
    updateHeaderSurat,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["header-surat"]);
        message.success("Header berhasil diubah");
        handleCloseModal();
      },
      onError: (error) => {
        message.error(error.message);
      },
    }
  );

  const { mutateAsync: deleteHeader } = useMutation(deleteHeaderSurat, {
    onSuccess: () => {
      queryClient.invalidateQueries(["header-surat"]);
      message.success("Header berhasil dihapus");
    },
  });

  // Modal handlers
  const handleOpenModal = (type, data = null) => {
    setModalState({ isOpen: true, type, data });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, type: "create", data: null });
  };

  const handleSubmit = async (values) => {
    if (modalState.type === "create") {
      await createHeader(values);
    } else {
      await updateHeader({ id: modalState.data.id, data: values });
    }
  };

  // Table columns
  const columns = [
    {
      title: "Nama Instansi / Perangkat Daerah",
      dataIndex: "nama_instansi",
      key: "nama_instansi",
    },
    {
      title: "Nama Perangkat Daerah",
      dataIndex: "nama_perangkat_daerah",
      key: "nama_perangkat_daerah",
    },
    {
      title: "Alamat",
      dataIndex: "alamat",
      key: "alamat",
    },
    {
      title: "Telepon",
      dataIndex: "telepon",
      key: "telepon",
    },
    {
      title: "Laman Web",
      dataIndex: "laman_web",
      key: "laman_web",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <>
          <Button onClick={() => handleOpenModal("update", record)}>
            Edit
          </Button>
          <Button
            danger
            onClick={() => deleteHeader(record.id)}
            style={{ marginLeft: 8 }}
          >
            Hapus
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => handleOpenModal("create")}
        style={{ marginBottom: 16 }}
      >
        Tambah Header
      </Button>

      <HeaderModal
        open={modalState.isOpen}
        onClose={handleCloseModal}
        data={modalState.data}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        type={modalState.type}
      />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={headers}
        pagination={false}
        loading={isLoadingHeaders}
      />
    </div>
  );
};

export default HeaderLetter;

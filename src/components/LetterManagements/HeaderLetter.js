import {
  checkHeaderSurat,
  createHeaderSurat,
  deleteHeaderSurat,
  getHeaderSurat,
  updateHeaderSurat,
} from "@/services/letter-managements.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Form, Input, message, Modal, Space, Table } from "antd";
import { useEffect, useState } from "react";
import FormUnorMaster from "../Utils/UnorMaster";

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
        <FormUnorMaster name="skpd_id" type="fasilitator" required={true} />
        <Form.Item
          label="Nama Perangkat Daerah"
          name="nama_perangkat_daerah"
          rules={[
            { required: true, message: "Nama perangkat daerah harus diisi" },
          ]}
          tooltip="Contoh: Badan Kepegawaian Daerah"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Alamat"
          name="alamat"
          rules={[{ required: true, message: "Alamat harus diisi" }]}
          tooltip="contoh: Jalan Siwalankerto Utara II / 42 Wonocolo, Surabaya, Jawa Timur 60236"
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          label="Telepon"
          name="telepon"
          // contoh format (031) 8477551
          rules={[{ required: true, message: "Telepon harus diisi" }]}
          tooltip="contoh: (031) 8477551"
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Laman Web"
          name="laman_web"
          tooltip="contoh: bkd.jatimprov.go.id"
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
          tooltip="contoh: bkd@jatimprov.go.id"
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

  const { mutateAsync: checkHeader, isLoading: isChecking } = useMutation(
    (id) => checkHeaderSurat(id),
    {
      onSuccess: (data) => {
        const file = data.data;
        // download file as docx
        const url = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${file}`;
        // rename file as cek_header.docx
        const filename = `cek_header.docx`;
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        message.success("Header berhasil di cek");
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
      title: "ID SKPD",
      dataIndex: "skpd_id",
      key: "skpd_id",
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleOpenModal("update", record)}>
            Edit
          </Button>
          <Button
            type="link"
            onClick={() => checkHeader(record.id)}
            style={{ marginLeft: 8 }}
          >
            Cek
          </Button>

          <Button
            type="link"
            onClick={() => deleteHeader(record.id)}
            style={{ marginLeft: 8 }}
          >
            Hapus
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Header Surat">
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
    </Card>
  );
};

export default HeaderLetter;

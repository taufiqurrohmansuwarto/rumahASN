import {
  createBezJf,
  deleteBezJf,
  fetchBezJf,
  updateBezJf,
  uploadBezzetingJF,
} from "@/services/bezzeting.services";
import { FileAddOutlined, FileOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Upload,
} from "antd";
import React, { useEffect, useState } from "react";

const ModalAddBezzeting = ({
  open,
  onCancel,
  create,
  isLoadingCreate,
  update,
  isLoadingUpdate,
  type = "create",
  data = {},
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (type === "update") {
      form.setFieldsValue(data);
    }
  }, [data, form, type]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (type === "update") {
        const payload = {
          kode: data?.kode,
          data: values,
        };
        update(payload);
      } else if (type === "create") {
        create(values);
      }
    } catch (error) {
      message.error("Gagal menambahkan data");
    }
  };

  return (
    <Modal
      confirmLoading={isLoadingCreate || isLoadingUpdate}
      onOk={handleSubmit}
      title={type === "create" ? "Tambah Data" : "Ubah Data"}
      open={open}
      onCancel={onCancel}
      width={800}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="kode" label="Kode Jabatan">
          <Input />
        </Form.Item>
        <Form.Item name="nama_jabatan" label="Nama Jabatan">
          <Input />
        </Form.Item>
        <Form.Item name="instansi_pembina_jf" label="Instansi Pembina JF">
          <Input />
        </Form.Item>
        <Row>
          <Col md={6}>
            <Form.Item name="abk" label="ABK">
              <InputNumber />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item
              name="rekom_instansi_pembina"
              label="Rekom Instansi Pembina"
            >
              <InputNumber />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item
              name="jml_penetapan_panrb"
              label="Jumlah Penetapan PAN RB"
            >
              <InputNumber />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item name="impassing" label="Impassing">
              <InputNumber />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Item name="bez_saat_ini" label="Bezzeting Saat Ini">
              <InputNumber />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item name="kelebihan_kekurangan" label="Kelebihan Kekurangan">
              <InputNumber />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="keterangan" label="Keterangan">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function AdminBezzeting() {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState("create");
  const [dataUpdate, setDataUpdate] = useState({});

  const handleOpen = () => {
    setOpen(true);
    setAction("create");
  };

  const handleClose = () => setOpen(false);

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(["bez-jf"], () => fetchBezJf(), {});
  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createBezJf(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("bez-jf");
        message.success("Data berhasil ditambahkan");
        handleClose();
      },
      onError: () => {
        message.error("Gagal menambahkan data");
      },
    }
  );

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateBezJf(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("bez-jf");
        message.success("Data berhasil diubah");
        handleClose();
      },
      onError: () => {
        message.error("Gagal mengubah data");
      },
    }
  );

  const { mutateAsync: remove } = useMutation((kode) => deleteBezJf(kode), {
    onSuccess: () => {
      queryClient.invalidateQueries("bez-jf");
      message.success("Data berhasil dihapus");
    },
    onError: () => {
      message.error("Gagal menghapus data");
    },
  });

  const handleRemove = async (id) => {
    await remove(id);
  };

  const handleUpdate = (data) => {
    setDataUpdate(data);
    setAction("update");
    setOpen(true);
  };

  const columns = [
    {
      title: "Kode Jabatan",
      dataIndex: "kode",
    },
    {
      title: "Nama Jabatan Fungsional",
      dataIndex: "nama_jabatan",
    },
    {
      title: "Instansi Pembina Jabatan Fungsional",
      dataIndex: "instansi_pembina_jf",
    },
    {
      title: "ABK",
      dataIndex: "abk",
    },
    {
      title: "Rekomendasi",
      dataIndex: "rekom_instansi_pembina",
    },
    {
      title: "Jumlah",
      dataIndex: "jml_penetapan_panrb",
    },
    {
      title: "Inpassing",
      dataIndex: "impassing",
    },
    {
      title: "Bezzeting",
      dataIndex: "bez_saat_ini",
    },
    {
      title: "Kelebihan Kekurangan",
      dataIndex: "kelebihan_kekurangan",
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
    },
    {
      title: "Aksi",
      render: (_, record) => (
        <Space>
          <a onClick={() => handleUpdate(record)}>Edit</a>
          <Divider type="vertical" />
          <Popconfirm
            onConfirm={() => handleRemove(record?.kode)}
            title="Apakah anda yakin ingin menghapus?"
          >
            Hapus
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const { mutateAsync: upload, isLoading: isLoadingUpload } = useMutation(
    (file) => uploadBezzetingJF(file),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("bez-jf");
        message.success("Data berhasil diunggah");
      },
      onError: () => {
        message.error("Gagal mengunggah data");
      },
    }
  );

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", fileList[0]);
    await upload(formData);
  };

  const [fileList, setFileList] = useState([]);

  const props = {
    beforeUpload: (file) => {
      // jika bukan file excel
      if (
        file.type !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        message.error("File yang diunggah harus berformat excel");
        return false;
      }

      setFileList([file]);
      return false;
    },
    fileList,
  };

  return (
    <div>
      <ModalAddBezzeting
        update={update}
        data={dataUpdate}
        isLoadingUpdate={isLoadingUpdate}
        type={action}
        create={create}
        isLoadingCreate={isLoadingCreate}
        open={open}
        onCancel={handleClose}
      />

      <Button
        style={{
          marginBottom: 16,
        }}
        onClick={handleOpen}
      >
        Tambah
      </Button>
      <Stack>
        <Space direction="vertical">
          <Upload
            showUploadList={{
              downloadIcon: false,
              previewIcon: false,
              removeIcon: false,
              showDownloadIcon: false,
              showPreviewIcon: false,
              showRemoveIcon: false,
            }}
            {...props}
            multiple={false}
            fileList={fileList}
            maxCount={1}
          >
            <Button icon={<FileAddOutlined />}>Unggah File</Button>
          </Upload>
          <Button
            type="primary"
            onClick={handleUpload}
            disabled={isLoadingUpload || fileList.length === 0}
            loading={isLoadingUpload}
          >
            {isLoadingUpload ? "Uploading" : "Start Upload"}
          </Button>
        </Space>
      </Stack>
      <Table
        rowKey={(row) => row?.kode}
        columns={columns}
        pagination={false}
        loading={isLoading}
        dataSource={data}
      />
    </div>
  );
}

export default AdminBezzeting;

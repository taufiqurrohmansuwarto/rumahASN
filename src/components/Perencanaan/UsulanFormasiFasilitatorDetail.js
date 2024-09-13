import FormUnorFasilitator from "@/components/Perencanaan/FormUnorFasilitator";
import {
  createUsulanDetailByUser,
  deleteUsulanDetailByUser,
  findUsulanDetailByUser,
  updateUsulanDetailByUser,
  uploadUsulanDetailByUser,
} from "@/services/perencanaan.services";
import {
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Divider,
  Form,
  message,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  Upload,
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FormSiasnPendidikan from "./FormSiasnPendidikan";
import FormSimasterJFU from "./FormSimasterJFU";
import dayjs from "dayjs";

const ModalUsulanFormasi = ({
  open,
  onClose,
  id,
  type,
  create,
  update,
  loading,
  currentData,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (type === "update") {
      form.setFieldsValue(currentData);
    }
  }, [type, form, currentData]);

  const handleSubmit = async () => {
    const data = await form.validateFields();
    if (type === "create") {
      const payload = {
        id,
        data,
      };

      create(payload);
    } else {
      const payload = {
        id,
        detailId: currentData?.id,
        data,
      };

      update(payload);
    }
  };

  return (
    <Modal
      onOk={handleSubmit}
      confirmLoading={loading}
      open={open}
      onCancel={onClose}
      title="Tambah Usulan Formasi"
      width={800}
    >
      <Form layout="vertical" form={form}>
        <FormUnorFasilitator name="simaster_skpd_id" />
        <FormSimasterJFU name="simaster_jfu_id" />
        <Form.Item
          name="sudah_menduduki_jabatan"
          label="Sudah Menduduki Jabatan Tersebut"
        >
          <Switch />
        </Form.Item>

        <FormSiasnPendidikan name="siasn_pend_id" />
      </Form>
    </Modal>
  );
};

const ModalUploadDokumen = ({ open, onClose, id, upload, loading }) => {
  const [fileList, setFileList] = useState([]);
  const handleChange = (info) => {
    let fileList = [...info.fileList];

    fileList = fileList.slice(-1);

    fileList = fileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(fileList);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    const file = fileList[0]?.originFileObj;
    formData.append("file", file);
    const payload = {
      id: id,
      detailId: id,
      file: formData,
    };

    upload(payload);
  };

  const props = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: () => {
      return false;
    },
    maxCount: 1,
    accept: ".pdf",
    onChange: handleChange,
  };

  return (
    <Modal
      onOk={handleSubmit}
      confirmLoading={loading}
      open={open}
      onCancel={onClose}
      title="Upload Dokumen"
    >
      <Upload {...props}>
        <Button>Upload</Button>
      </Upload>
    </Modal>
  );
};

function UsulanFormasiFasilitatorDetail() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("create");
  const [currentData, setCurrentData] = useState(null);

  const [showModalUpload, setShowModalUpload] = useState(false);
  const [key, setKey] = useState(null);
  const handleShowModalUpload = (key) => {
    setKey(key);
    setShowModalUpload(true);
  };
  const handleCloseModalUpload = () => {
    setKey(null);
    setShowModalUpload(false);
  };

  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = router.query;

  const handleClose = () => {
    setOpen(false);
    setType("");
  };

  const handleOpen = (type) => {
    setOpen(true);
    setType(type);
  };

  const { data, isLoading } = useQuery(
    ["usulan-perencanaan-detail", id],
    () => findUsulanDetailByUser(id),
    {
      enabled: !!id,
    }
  );

  const { mutate: upload, isLoading: isLoadingUpload } = useMutation(
    (data) => uploadUsulanDetailByUser(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["usulan-perencanaan-detail", id]);
        handleCloseModalUpload();
        message.success("Berhasil mengupload usulan");
      },
      onError: () => {
        message.error("Gagal mengupload usulan");
      },
    }
  );

  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createUsulanDetailByUser(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["usulan-perencanaan-detail", id]);
        message.success("Berhasil membuat usulan");
        handleClose();
      },
      onError: () => {
        message.error("Gagal membuat usulan");
      },
    }
  );

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateUsulanDetailByUser(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["usulan-perencanaan-detail", id]);
        handleClose();
        message.success("Berhasil mengubah usulan");
      },
      onError: () => {
        message.error("Gagal mengubah usulan");
      },
    }
  );

  const { mutateAsync: remove, isLoading: isLoadingRemove } = useMutation(
    (data) => deleteUsulanDetailByUser(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["usulan-perencanaan-detail", id]);
        message.success("Berhasil menghapus usulan");
        handleClose();
      },
      onError: () => {
        message.error("Gagal menghapus usulan");
      },
    }
  );

  const handleUpdate = (record) => {
    setType("update");
    setOpen(true);
    setCurrentData(record);
  };

  const handleRemove = async (detailId) => {
    const payload = {
      id,
      detailId,
    };
    await remove(payload);
  };

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      render: (_, record, index) => index + 1,
    },
    {
      title: "File",
      key: "file",
      render: (_, record) => (
        <>
          {record?.dokumen_usulan ? (
            <a
              href={`https://siasn.bkd.jatimprov.go.id:9000/public/${record?.dokumen_usulan}`}
              target="_blank"
              rel="noreferrer"
            >
              <FilePdfOutlined />
            </a>
          ) : null}
        </>
      ),
    },
    {
      title: "Nama Jabatan",
      key: "jabatan",
      render: (_, record) => record?.pelaksana?.name,
    },
    {
      title: "Kelas",
      key: "kelas",
      render: (_, record) => record?.pelaksana?.kelas_jab,
    },
    {
      title: "Pendidikan",
      key: "pendidikan",
      render: (_, record) => record?.pendidikan?.nama,
    },
    {
      title: "Sudah Menduduki di Jabatan tersebut",
      key: "sudah_menduduki_jabatan",
      render: (_, record) =>
        record?.sudah_menduduki_jabatan ? (
          <Tag color="green">Sudah</Tag>
        ) : (
          <Tag color="red">Belum</Tag>
        ),
    },
    {
      title: "Perangkat Daerah",
      key: "opd",
      render: (_, record) =>
        record?.detailOpd?.detail?.map((d) => d?.name)?.join("-"),
    },
    {
      title: "Dibuat pada",
      key: "created_at",
      render: (_, record) =>
        dayjs(record.created_at).format("DD MMM YYYY HH:mm:ss"),
    },
    {
      title: "Diedit pada",
      key: "updated_at",
      render: (_, record) =>
        dayjs(record.updated_at).format("DD MMM YYYY HH:mm:ss"),
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => (
        <Space direction="horizontal">
          <a onClick={() => handleUpdate(record)}>
            <EditOutlined />
          </a>
          <Divider type="vertical" />
          <a onClick={() => handleShowModalUpload(record.id)}>
            <CloudUploadOutlined />
          </a>
          <Divider type="vertical" />
          <Popconfirm
            title="Apakah anda yakin ingin menghapus usulan ini?"
            onConfirm={() => handleRemove(record.id)}
          >
            <a>
              <DeleteOutlined />
            </a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space>
        <Button
          style={{ marginBottom: 16 }}
          type="primary"
          onClick={() => handleOpen("create")}
        >
          Tambah Usulan
        </Button>
      </Space>
      <Table
        pagination={false}
        rowKey={(row) => row?.id}
        dataSource={data}
        loading={isLoading}
        columns={columns}
      />
      <ModalUploadDokumen
        upload={upload}
        loading={isLoadingUpload}
        open={showModalUpload}
        onClose={handleCloseModalUpload}
        id={key}
      />
      <ModalUsulanFormasi
        open={open}
        onClose={handleClose}
        currentData={currentData}
        id={id}
        type={type}
        create={create}
        update={update}
        loading={isLoadingCreate || isLoadingUpdate}
      />
    </Card>
  );
}

export default UsulanFormasiFasilitatorDetail;

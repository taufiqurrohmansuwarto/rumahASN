import FormUnorFasilitator from "@/components/Perencanaan/FormUnorFasilitator";
import {
  deleteUsulanDetailByUser,
  findUsulanDetailByUser,
  updateUsulanDetailByUser,
  createUsulanDetailByUser,
} from "@/services/perencanaan.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Form,
  Modal,
  Button,
  message,
  Space,
  Popconfirm,
  Divider,
} from "antd";
import { useRouter } from "next/router";
import FormSiasnPendidikan from "./FormSiasnPendidikan";
import FormSimasterJFU from "./FormSimasterJFU";
import { useEffect, useState } from "react";
import { DownloadOutlined } from "@ant-design/icons";

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
    >
      <Form layout="vertical" form={form}>
        <FormUnorFasilitator name="simaster_skpd_id" />
        <FormSimasterJFU name="simaster_jfu_id" />
        <FormSiasnPendidikan name="siasn_pend_id" />
      </Form>
    </Modal>
  );
};

function UsulanFormasiFasilitatorDetail() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("create");
  const [currentData, setCurrentData] = useState(null);

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
      title: "Perangkat Daerah",
      key: "opd",
      render: (_, record) =>
        record?.detailOpd?.detail?.map((d) => d?.name)?.join("-"),
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => (
        <Space direction="horizontal">
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
    <div>
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
    </div>
  );
}

export default UsulanFormasiFasilitatorDetail;

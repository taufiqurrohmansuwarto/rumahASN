import {
  createSubmissionWithFiles,
  getSubmissionWithFiles,
  getSubmissionsFileRefs,
  deleteSubmissionWithFiles,
  updateSubmissionWithFiles,
} from "@/services/submissions.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Form,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  message,
} from "antd";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const ModalFormEdit = ({
  open,
  onClose,
  data,
  files,
  update,
  isLoadingUpdate,
  id,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({ kode_file: data?.kode_file });
  }, [data, form]);

  const handleOk = async () => {
    try {
      const result = await form.validateFields();
      await update({ id, data: result });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      confirmLoading={isLoadingUpdate}
      onOk={handleOk}
      open={open}
      onCancel={onClose}
      title="Edit"
    >
      <Form layout="vertical" form={form}>
        <Form.Item label="File Usulan" name="kode_file">
          <Select showSearch optionFilterProp="name">
            {files?.map((item) => (
              <Select.Option name={item.kode} key={item.kode} value={item.kode}>
                {item.kode}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ModalFormUsulan = ({
  files,
  id,
  open,
  onClose,
  type = "create",
  create,
  isLoadingCreate,
}) => {
  const [form] = Form.useForm();

  // const router = useRouter();

  const handleOk = async () => {
    try {
      const result = await form.validateFields();
      await create({ id, data: result });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      centered
      open={open}
      confirmLoading={isLoadingCreate}
      onOk={handleOk}
      title={type === "create" ? "Tambah Usulan" : "Edit Usulan"}
      onCancel={onClose}
    >
      <Form layout="vertical" form={form}>
        <Form.Item label="File Usulan" name="kode_file">
          <Select showSearch optionFilterProp="name">
            {files?.map((item) => (
              <Select.Option name={item.kode} key={item.kode} value={item.kode}>
                {item.kode}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

function UsulanFile() {
  const router = useRouter();
  const { id } = router.query;
  const [open, setOpen] = React.useState(false);
  const [edit, setEdit] = React.useState(false);
  const [editData, setEditData] = React.useState(null);

  const queryClient = useQueryClient();

  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createSubmissionWithFiles(data),
    {
      onSuccess: () => {
        message.success("Berhasil membuat usulan");
        queryClient.invalidateQueries(["submissions-files-details", id]);
        handleClose();
      },
      onError: (error) => {
        message.error(error.message);
      },
    }
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEditOpen = (record) => {
    setEditData(record);
    setEdit(true);
  };

  const handleEditClose = () => {
    setEditData(null);
    setEdit(false);
  };

  const { data, isLoading } = useQuery(
    ["submissions-files-details", id],
    () => getSubmissionWithFiles(id),
    {
      enabled: !!id,
    }
  );

  const { data: files, isLoading: filesLoading } = useQuery(
    ["submissions_files"],
    () => getSubmissionsFileRefs(),
    {}
  );

  const { mutateAsync: remove, isLoading: isLoadingRemove } = useMutation(
    (data) => deleteSubmissionWithFiles(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus usulan");
        queryClient.invalidateQueries(["submissions-files-details", id]);
      },
      onError: (error) => {
        message.error(error.message);
      },
    }
  );

  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateSubmissionWithFiles(data),
    {
      onSuccess: () => {
        message.success("Berhasil merubah usulan");
        queryClient.invalidateQueries(["submissions-files-details", id]);
        handleEditClose();
      },
      onError: (error) => {
        message.error(error.message);
      },
    }
  );

  const hapusFile = async (id) => {
    const payload = { id: router.query.id, fileId: id };
    await remove(payload);
  };

  const columns = [
    { title: "Kode", dataIndex: "kode_file" },
    {
      title: "Aksi",
      key: "aksi",
      render: (row, record) => {
        return (
          <Space>
            <Popconfirm
              title="apakah anda yakin menghapus"
              onConfirm={async () => hapusFile(row.id)}
            >
              Hapus
            </Popconfirm>
            <a onClick={() => handleEditOpen(row)}>Edit</a>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Button
        style={{
          marginBottom: 16,
        }}
        onClick={handleOpen}
      >
        File Usulan
      </Button>
      <Table
        pagination={false}
        rowKey={(row) => row?.kode}
        columns={columns}
        dataSource={data}
        loading={isLoading}
      />
      <ModalFormUsulan
        create={create}
        id={router.query.id}
        isLoadingCreate={isLoadingCreate}
        files={files}
        type="create"
        open={open}
        onClose={handleClose}
      />
      <ModalFormEdit
        open={edit}
        onClose={handleEditClose}
        data={editData}
        files={files}
        isLoadingUpdate={isLoadingUpdate}
        update={update}
        id={router.query.id}
      />
    </div>
  );
}

export default UsulanFile;

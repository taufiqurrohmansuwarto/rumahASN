import {
  createSubmissionWithFiles,
  getSubmissionWithFiles,
  getSubmissionsFileRefs,
} from "@/services/submissions.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Modal, Select, Table, message } from "antd";
import { useRouter } from "next/router";
import React from "react";

const ModalFormUsulan = ({
  files,
  open,
  onClose,
  type = "create",
  create,
  isLoadingCreate,
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const result = await form.validateFields();
      await create({ id: router.query.id, data: result });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      centered
      open={open}
      confirmLoading={false}
      onOk={null}
      title={type === "create" ? "Tambah Usulan" : "Edit Usulan"}
      onCancel={onClose}
    >
      <Form layout="vertical" form={form}>
        <Form.Item label="File Usulan" name="file">
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

  const columns = [{ title: "Kode", dataIndex: "kode" }];

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
        files={files}
        type="create"
        open={open}
        onClose={handleClose}
      />
    </div>
  );
}

export default UsulanFile;

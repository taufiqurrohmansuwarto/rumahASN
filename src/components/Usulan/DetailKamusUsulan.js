import FormUnorSIMASTER from "@/components/Usulan/FormUnorSIMASTER";
import {
  createSubmissionPersonInCharge,
  deleteSubmissionPersonInCharge,
  getSubmissionPersonInCharge,
  getSubmissionReference,
  updateSubmissionPersonInCharge,
} from "@/services/submissions.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Divider, Form, Modal, Table, message } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import FormSearchUserBKD from "./FormSearchUserBKD";
import { FileAddOutlined } from "@ant-design/icons";
import { useEffect } from "react";

const FormEditPersonInCharge = ({ open, onCancel, loading, edit, data }) => {
  const router = useRouter();
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      ...data,
    });
  }, [data, form]);

  const handleOK = async () => {
    try {
      const result = await form.validateFields();
      const organization_id = result.organization.map((item) => item.value);
      const organization = result?.organization.map((item) => ({
        value: item.value,
        label: item.label,
      }));
      const user_id = result?.user?.value;

      const payload = {
        id: router.query.id,
        picId: data?.id,
        data: {
          ...result,
          organization_id,
          user: JSON.stringify(result?.user),
          user_id,
          organization: JSON.stringify(organization),
          submission_reference_id: router.query.id,
        },
      };
      await edit(payload);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      destroyOnClose
      confirmLoading={loading}
      onOk={handleOK}
      maskClosable={false}
      closable={false}
      title="Form PIC Usulan"
      centered
      open={open}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <FormSearchUserBKD name="user" />
        <FormUnorSIMASTER name="organization" />
      </Form>
    </Modal>
  );
};

const FormAddPersonInCharge = ({ open, onCancel, loading, add }) => {
  const router = useRouter();
  const [form] = Form.useForm();

  const handleOK = async () => {
    try {
      const result = await form.validateFields();
      const organization_id = result.organization.map((item) => item.value);
      const organization = result?.organization.map((item) => ({
        value: item.value,
        label: item.label,
      }));
      const user_id = result?.user?.value;

      const payload = {
        id: router.query.id,
        data: {
          ...result,
          organization_id,
          user: JSON.stringify(result?.user),
          user_id,
          organization: JSON.stringify(organization),
          submission_reference_id: router.query.id,
        },
      };
      await add(payload);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      destroyOnClose
      confirmLoading={loading}
      onOk={handleOK}
      maskClosable={false}
      closable={false}
      title="Form PIC Usulan"
      centered
      open={open}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <FormSearchUserBKD name="user" />
        <FormUnorSIMASTER name="organization" />
      </Form>
    </Modal>
  );
};

const PersonInChargeSubmission = ({ id }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [dataEdit, setDataEdit] = useState(null);
  const [edit, setEdit] = useState(false);
  const handleEdit = (value) => {
    setEdit(true);
    setDataEdit(value);
  };

  const handleCancelEdit = () => {
    setEdit(false);
    setDataEdit(null);
  };

  const { data, isLoading } = useQuery(
    ["person-in-charge", id],
    () => getSubmissionPersonInCharge(id),
    {}
  );

  const { mutateAsync: addPIC, isloading: isLoadingAddPIC } = useMutation(
    (data) => createSubmissionPersonInCharge(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["person-in-charge", id]);
        message.success("Berhasil menambahkan PIC");
        handleClose();
      },
      onError: () => {
        message.error("Gagal menambahkan PIC");
      },
    }
  );

  const { mutateAsync: updatePIC, isloading: isLoadingUpdatePIC } = useMutation(
    (data) => updateSubmissionPersonInCharge(data),
    {}
  );

  const { mutateAsync: deletePIC, isloading: isLoadingDeletePIC } = useMutation(
    (data) => deleteSubmissionPersonInCharge(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["person-in-charge", id]);
        message.success("Berhasil menghapus PIC");
      },
      onError: () => {
        message.error("Gagal menghapus PIC");
      },
    }
  );

  const columns = [
    {
      title: "Nama",
      key: "user_id",
      render: (value) => value?.user?.label,
    },
    {
      title: "Wilayah",
      key: "organization_id",
      render: (value) =>
        value?.organization?.map((item) => item.label).join(", "),
    },
    {
      title: "Aksi",
      render: (value) => {
        return (
          <>
            <a
              onClick={() => {
                Modal.confirm({
                  title: "Hapus PIC",
                  content: "Apakah anda yakin ingin menghapus PIC ini?",
                  okText: "Ya",
                  cancelText: "Tidak",
                  onOk: async () => {
                    await deletePIC({
                      id,
                      picId: value?.id,
                    });
                  },
                });
              }}
            >
              Hapus
            </a>
            <Divider type="vertical" />
            <a onClick={() => handleEdit(value)}>Edit</a>
          </>
        );
      },
    },
  ];

  return (
    <div>
      <Button onClick={handleOpen} type="primary" icon={<FileAddOutlined />}>
        PIC
      </Button>
      <FormAddPersonInCharge
        add={addPIC}
        loading={isLoadingAddPIC}
        open={open}
        onCancel={handleClose}
      />
      <FormEditPersonInCharge
        edit={updatePIC}
        data={dataEdit}
        loading={isLoadingUpdatePIC}
        open={edit}
        onCancel={handleCancelEdit}
      />
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(row) => row?.id}
        loading={isLoading}
        pagination={false}
      />
    </div>
  );
};

function DetailKamusUsulan() {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["detail-kamus-usulan", router.query.id],
    () => getSubmissionReference(router.query.id),
    {}
  );

  return (
    <div>
      {JSON.stringify(data)}
      <PersonInChargeSubmission id={router.query.id} />
    </div>
  );
}

export default DetailKamusUsulan;

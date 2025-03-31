import { getUserInformation } from "@/services/index";
import { updateUserInformation } from "@/services/webinar.services";
import { Alert, Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, message } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ModalForm = ({ open, onCancel, onSubmit, loading, data, id }) => {
  const [form] = Form.useForm();

  const handleFinish = async () => {
    const data = await form.validateFields();
    const payload = {
      id,
      data,
    };
    Modal.confirm({
      title: "Apakah anda yakin?",
      content: "Anda tidak dapat mengubah informasi ini lagi",
      okText: "Ya",
      centered: true,
      cancelText: "Tidak",
      onOk: async () => await onSubmit(payload),
    });
  };

  useEffect(() => {
    if (data) {
      if (data?.group === "GOOGLE") {
        form.setFieldsValue({
          name: data?.info?.username,
          employee_number: data?.info?.employee_number,
          jabatan: data?.info?.jabatan?.jabatan,
          instansi: data?.info?.perangkat_daerah?.detail,
        });
      } else {
        form.setFieldsValue({
          name: data?.username,
          employee_number: data?.employee_number,
          jabatan: data?.info?.jabatan?.jabatan,
          instansi: data?.info?.perangkat_daerah?.detail,
        });
      }
    }
  }, [data, form]);

  return (
    <Modal
      centered
      onOk={handleFinish}
      title="Informasi Sertifikat Pengguna"
      open={open}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <Stack>
        <Alert color="red" variant="filled">
          Pengisian informasi sertifikat ini hanya dapat dilakukan sekali saja.
          Pastikan data yang anda masukkan sudah benar.
        </Alert>
        <Form form={form} layout="vertical">
          <Form.Item
            rules={[
              {
                required: true,
                message: "Nama harus diisi",
              },
            ]}
            extra="ex: DONIE S.H."
            label="Nama"
            name="name"
          >
            <Input />
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: "NIP harus diisi",
              },
            ]}
            extra="Tanpa Spasi"
            label="NIP"
            name="employee_number"
          >
            <Input />
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Jabatan harus diisi",
              },
            ]}
            label="Jabatan"
            name="jabatan"
            normalize={
              // automatic capitalize
              (value) => value?.toUpperCase()
            }
          >
            <Input />
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Instansi harus diisi",
              },
            ]}
            normalize={
              // automatic capitalize
              (value) => value?.toUpperCase()
            }
            extra="Contoh: Dinas Perindustrian dan Perdangan - Perdagangan Dalam Negeri"
            label="Instansi"
            name="instansi"
          >
            <Input.TextArea rows={5} />
          </Form.Item>
        </Form>
      </Stack>
    </Modal>
  );
};

function FormUserInformation() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const queryClient = useQueryClient();

  const { data: information, isLoading } = useQuery(
    ["user-information"],
    () => getUserInformation(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateUserInformation(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengubah informasi sertifikat");
        queryClient.invalidateQueries([
          "webinar-user-detail",
          router?.query?.id,
        ]);
        handleClose();
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );

  return (
    <>
      <ModalForm
        open={open}
        onCancel={handleClose}
        id={router?.query?.id}
        data={information}
        onSubmit={update}
        loading={isLoadingUpdate}
      />
      <Button type="primary" onClick={handleOpen}>
        Update Informasi Sertifikat
      </Button>
    </>
  );
}

export default FormUserInformation;

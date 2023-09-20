import { getUserInformation, updateGoogleInformation } from "@/services/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Skeleton, message } from "antd";
import { trim } from "lodash";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const FormGoogleInformation = ({ open, handleCancel, information }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      jabatan: information?.jabatan?.jabatan,
      perangkat_daerah: information?.perangkat_daerah?.detail,
      username: information?.username,
      gelar_depan: information?.gelar_depan,
      gelar_belakang: information?.gelar_belakang,
      employee_number: information?.employee_number,
    });
  }, [information, form]);

  const queryClient = useQueryClient();

  const { mutate: update, isLoading } = useMutation(
    (data) => updateGoogleInformation(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["google-information"]);
        message.success("Berhasil mengubah informasi");
        handleCancel();
      },
      onError: () => {
        message.error("Gagal mengubah informasi");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["user-information"]);
      },
    }
  );

  const handleFinish = async () => {
    const value = await form.validateFields();

    const payload = {
      jabatan: {
        jabatan: trim(value.jabatan),
      },
      perangkat_daerah: {
        detail: trim(value.perangkat_daerah),
      },
      username: trim(value.username),
      gelar_depan: trim(value.gelar_depan),
      gelar_belakang: trim(value.gelar_belakang),
      employee_number: trim(value.employee_number),
    };

    update(payload);
  };

  return (
    <Modal
      onOk={handleFinish}
      confirmLoading={isLoading}
      title="Edit Informasi"
      open={open}
      onCancel={handleCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Gelar Depan"
          extra="Jika Tidak diisi Kosongkan saja"
          name="gelar_depan"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Gelar Belakang"
          extra="Jika Tidak diisi Kosongkan saja"
          name="gelar_belakang"
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Nama lengkap harus diisi",
            },
          ]}
          normalize={
            // automatic capitalize
            (value) => value?.toUpperCase()
          }
          label="Nama Lengkap"
          extra="Nama Lengkap tanpa gelar"
          name="username"
          required
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: "Nomer Pegawai harus diisi",
            },
          ]}
          extra="Jika kamu PNS gunakan NIP, atau gunakan Nomer Pegawai jika kamu bukan PNS"
          label="Nomer Pegawai"
          name="employee_number"
          required
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
          normalize={
            // automatic capitalize
            (value) => value?.toUpperCase()
          }
          label="Jabatan"
          name="jabatan"
          required
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
          extra="Tulis secara detail Instansi anda dengan pemisah tanda hubung (-). Contoh : Pemerintah Provinsi Kalimantan Tengah - Biro Pemerintahan"
          label="Instansi"
          name="perangkat_daerah"
          required
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function GoogleEditInformation() {
  const { data, status } = useSession();
  const [open, setOpen] = useState(false);

  const {
    data: information,
    isLoading,
    refetch,
  } = useQuery(["user-information"], () => getUserInformation(), {});

  const handleOpen = () => {
    refetch();
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  if (data?.user?.group !== "GOOGLE") {
    return null;
  } else {
    return (
      <Skeleton loading={isLoading}>
        <Button
          style={{
            marginBottom: 16,
          }}
          type="primary"
          block
          onClick={handleOpen}
        >
          Edit Informasi
        </Button>
        <FormGoogleInformation
          handleCancel={handleClose}
          information={information?.info}
          open={open}
        />
      </Skeleton>
    );
  }
}

export default GoogleEditInformation;

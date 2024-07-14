import { Button, DatePicker, Form, Input, Modal, Select, message } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import FormPenghargaan from "./FormPenghargaan";
import FileUploadSIASN from "./FileUploadSIASN";
import useFileStore from "@/store/useFileStore";
import { uploadDokRiwayat } from "@/services/siasn-services";
import { useQueryClient } from "@tanstack/react-query";

function ModalCreatePenghargaan({ open, onCancel, onSubmit, loading, nip }) {
  const queryClient = useQueryClient();

  const format = "DD-MM-YYYY";
  const [form] = Form.useForm();

  const fileList = useFileStore((state) => state.fileList);

  const handleOk = async () => {
    const value = await form.validateFields();
    const data = {
      ...value,
      skDate: dayjs(value.skDate).format(format),
      tahun: dayjs(value.tahun).format("YYYY"),
    };

    const payload = {
      nip,
      data,
    };

    const file = fileList[0]?.originFileObj;

    if (file) {
      const responsePenghargaan = await onSubmit(payload);
      const idPenghargaan = responsePenghargaan?.id;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("id_riwayat", idPenghargaan);
      formData.append("id_ref_dokumen", "892");

      await uploadDokRiwayat(formData);
      queryClient.invalidateQueries(["riwayat-penghargaan-nip", nip]);
      message.success("Berhasil menambahkan penghargaan");
      onCancel();
    } else {
      await onSubmit(payload);
      queryClient.invalidateQueries(["riwayat-penghargaan-nip", nip]);
      message.success("Berhasil menambahkan penghargaan");
      onCancel();
    }
  };

  return (
    <>
      <Modal
        title="Tambah Penghargaan"
        open={open}
        onCancel={onCancel}
        onOk={handleOk}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <FileUploadSIASN />
          <FormPenghargaan name="hargaId" label="Jenis Penghargaan" />
          <Form.Item
            rules={[
              {
                required: true,
                message: "Tanggal SK harus diisi",
              },
            ]}
            name="skDate"
            label="Tanggal SK"
          >
            <DatePicker format={format} />
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Nomor SK harus diisi",
              },
            ]}
            name="skNomor"
            label="Nomor SK"
          >
            <Input />
          </Form.Item>
          <Form.Item
            rules={[
              {
                required: true,
                message: "Tahun harus diisi",
              },
            ]}
            name="tahun"
            label="Tahun"
          >
            <DatePicker picker="year" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

const CreatePenghargaan = ({ nip, onSubmit, loading }) => {
  const [open, setOpen] = useState();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button type="primary" onClick={handleOpen}>
        Tambah Penghargaan
      </Button>
      <ModalCreatePenghargaan
        nip={nip}
        open={open}
        onCancel={handleClose}
        onSubmit={onSubmit}
        loading={loading}
      />
    </>
  );
};

export default CreatePenghargaan;

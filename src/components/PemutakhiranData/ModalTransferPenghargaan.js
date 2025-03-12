import { uploadDokRiwayat } from "@/services/siasn-services";
import { useQueryClient } from "@tanstack/react-query";
import { DatePicker, Form, Input, Modal, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import FormPenghargaan from "./FormPenghargaan";

function ModalTransfer({
  open,
  onCancel,
  onSubmit,
  loading,
  nip,
  value,
  file,
}) {
  const queryClient = useQueryClient();

  const format = "DD-MM-YYYY";
  const [form] = Form.useForm();
  const [currentLoading, setCurrentLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      ...value,
      hargaId: value?.hargaId?.toString(),
      skDate: dayjs(value?.skDate, format),
      tahun: dayjs(value?.tahun, "YYYY"),
    });
  }, [value, form]);

  const handleOk = async () => {
    try {
      setCurrentLoading(true);
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

      if (file) {
        const responsePenghargaan = await onSubmit(payload);
        const idPenghargaan = responsePenghargaan?.id;
        console.log(idPenghargaan);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("id_riwayat", idPenghargaan);
        formData.append("id_ref_dokumen", "892");

        await uploadDokRiwayat(formData);
        message.success("Berhasil menambahkan penghargaan");
      } else {
        await onSubmit(payload);
        message.success("Berhasil menambahkan penghargaan");
      }
    } catch (error) {
      setCurrentLoading(false);
      queryClient.invalidateQueries(["riwayat-penghargaan-nip-siasn"]);
    } finally {
      queryClient.invalidateQueries(["riwayat-penghargaan-nip-siasn"]);
      onCancel();
    }
  };

  return (
    <>
      <Modal
        title="Tambah Penghargaan"
        open={open}
        width={800}
        destroyOnClose
        onCancel={onCancel}
        onOk={handleOk}
        confirmLoading={loading || currentLoading}
      >
        <a href={`${value?.file}`} target="_blank" rel="noreferrer">
          File
        </a>
        <Form form={form} layout="vertical">
          <FormPenghargaan
            disabled={true}
            name="hargaId"
            label="Jenis Penghargaan"
          />
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
            <DatePicker disabled={true} format={format} />
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
            <Input disabled={true} />
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
            <DatePicker disabled={true} picker="year" format="YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

const ModalTransferPenghargaan = ({
  nip,
  onSubmit,
  loading,
  value,
  open,
  onCancel,
  file,
}) => {
  return (
    <>
      <ModalTransfer
        value={value}
        nip={nip}
        open={open}
        file={file}
        onCancel={onCancel}
        onSubmit={onSubmit}
        loading={loading}
      />
    </>
  );
};

export default ModalTransferPenghargaan;

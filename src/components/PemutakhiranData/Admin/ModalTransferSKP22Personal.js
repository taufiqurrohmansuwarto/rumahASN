import FormCariAtasanKinerja from "@/components/PemutakhiranData/FormCariAtasanKinerja";
import { postRwSkp22, uploadDokRiwayat } from "@/services/siasn-services";
import { serializeKinerja } from "@/utils/transfer-siasn.utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Modal, Select, Spin, message } from "antd";
import { useEffect } from "react";

function ModalTransferSKP22Personal({
  open,
  onCancel,
  data,
  loadingFile,
  file,
}) {
  const queryClient = useQueryClient();

  const [form] = Form.useForm();

  const { mutateAsync: transfer, isLoading: isLoadingTransfer } = useMutation(
    (data) => postRwSkp22(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["data-skp-22"]);
      },
      onError: (error) => {
        message.error(error?.message);
      },
      onSettled: () => {
        message.success("Berhasil");
        queryClient.invalidateQueries(["data-skp-22"]);
        onCancel();
      },
    }
  );

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      data: values,
    };
    if (!file) {
      await transfer(payload);
    } else {
      const result = await transfer(payload);
      const id = result?.id;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("id_riwayat", id);
      formData.append("id_ref_dokumen", "890");
      await uploadDokRiwayat(formData);
      queryClient.invalidateQueries(["data-skp-22"]);
    }
  };

  useEffect(() => {
    if (data) {
      const currentData = {
        ...data,
        ...serializeKinerja(data),
      };
      form.setFieldsValue(currentData);
    }
  }, [data, form]);

  return (
    <>
      <Spin spinning={loadingFile} fullscreen />
      <Modal
        width={600}
        centered
        title="Transfer data SKP"
        open={open}
        onCancel={onCancel}
        onOk={handleSubmit}
        confirmLoading={isLoadingTransfer}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="hasilKinerjaNilai"
            label="Hasil Kerja Nilai"
            required
          >
            <Select disabled>
              <Select.Option value="1">DIATAS EKSPETASI</Select.Option>
              <Select.Option value="2">SESUAI EKSPETASI</Select.Option>
              <Select.Option value="3">DIBAWAH EKSPETASI</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="perilakuKerjaNilai"
            label="Perilaku Kerja Nilai"
            required
          >
            <Select disabled>
              <Select.Option value="1">DIATAS EKSPETASI</Select.Option>
              <Select.Option value="2">SESUAI EKSPETASI</Select.Option>
              <Select.Option value="3">DIBAWAH EKSPETASI</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="tahun" label="Tahun Penilaian" required>
            <Select disabled>
              <Select.Option value="2025">TAHUN PENILAIAN 2025</Select.Option>
              <Select.Option value="2024">TAHUN PENILAIAN 2024</Select.Option>
              <Select.Option value="2023">TAHUN PENILAIAN 2023</Select.Option>
              <Select.Option value="2022">TAHUN PENILAIAN 2022</Select.Option>
            </Select>
          </Form.Item>
          <a href={data?.file_skp} target="_blank" rel="noreferrer">
            Lihat Penilai
          </a>
          <FormCariAtasanKinerja label="Atasan Penilai" name="pns_penilai" />
        </Form>
      </Modal>
    </>
  );
}

export default ModalTransferSKP22Personal;

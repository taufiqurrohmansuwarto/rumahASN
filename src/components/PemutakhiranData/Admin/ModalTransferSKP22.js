import React, { useEffect } from "react";
import { Modal, Form, Select, Spin, message } from "antd";
import FormCariPNSKinerja from "../FormCariPNSKinerja";
import { serializeKinerja } from "@/utils/transfer-siasn.utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postRwSkp22ByNip, uploadDokRiwayat } from "@/services/siasn-services";

function ModalTransferSKP22({ open, onCancel, data, loadingFile, nip, file }) {
  const queryClient = useQueryClient();

  const { mutateAsync: transfer, isLoading: isLoadingTransfer } = useMutation(
    (data) => postRwSkp22ByNip(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["data-skp-22", nip]);
        message.success("Berhasil menambahkan SKP");
        onCancel();
      },
      onError: () => {
        message.error("Gagal menambahkan SKP");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["data-skp-22", nip]);
      },
    }
  );

  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      nip,
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
      queryClient.invalidateQueries(["data-skp-22", nip]);
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
        title="Transfer SKP"
        open={open}
        width={750}
        onCancel={onCancel}
        confirmLoading={isLoadingTransfer}
        onOk={handleSubmit}
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
              <Select.Option value="2024">TAHUN PENILAIAN 2024</Select.Option>
              <Select.Option value="2023">TAHUN PENILAIAN 2023</Select.Option>
              <Select.Option value="2022">TAHUN PENILAIAN 2022</Select.Option>
            </Select>
          </Form.Item>
          <a href={data?.file_skp} target="_blank" rel="noreferrer">
            Lihat Penilai
          </a>
          <FormCariPNSKinerja
            help="ketik NIP Tanpa Spasi dan tunggu..."
            label="Atasan Penilai"
            name="pns_penilai"
          />
        </Form>
      </Modal>
    </>
  );
}

export default ModalTransferSKP22;

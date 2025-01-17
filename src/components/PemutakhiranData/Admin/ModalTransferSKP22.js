import React, { useEffect } from "react";
import { Modal, Form, Select, Spin } from "antd";
import FormCariPNSKinerja from "../FormCariPNSKinerja";
import { serializeKinerja } from "@/utils/transfer-siasn.utils";

function ModalTransferSKP22({ open, onCancel, data, loadingFile }) {
  const [form] = Form.useForm();

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
        onOk={() => null}
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

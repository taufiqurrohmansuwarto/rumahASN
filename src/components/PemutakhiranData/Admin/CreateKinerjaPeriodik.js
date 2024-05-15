import { Button, Form, Input, InputNumber, Modal } from "antd";
import React from "react";
import { useState } from "react";

/**
 * 
 * {
  "bulanMulaiPenilaian": 0,
  "bulanSelesaiPenilaian": 0,
  "hasilKinerjaNilai": 0,
  "id": "string",
  "koefisienId": "string",
  "kuadranKinerjaNilai": 0,
  "path": [
    {
      "dok_id": "string",
      "dok_nama": "string",
      "dok_uri": "string",
      "object": "string",
      "slug": "string"
    }
  ],
  "penilaiGolongan": "string",
  "penilaiJabatanNama": "string",
  "penilaiNama": "string",
  "penilaiNipNrp": "string",
  "penilaiUnorNama": "string",
  "perilakuKerjaNilai": 0,
  "periodikId": "string",
  "pnsDinilaiId": "string",
  "statusPenilai": "string",
  "tahun": 0,
  "tahunMulaiPenilaian": 0,
  "tahunSelesaiPenilaian": 0
}

Parameter c
 */

const ModalCreate = ({ visible, onClose }) => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Received values of form: ", values);
  };

  return (
    <Modal
      centered
      width={800}
      title="Basic Modal"
      open={visible}
      onOk={onClose}
      onCancel={onClose}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item name="bulanMulaiPenilaian" label="Bulan Mulai Penilaian">
          <InputNumber />
        </Form.Item>
        <Form.Item name="bulanSelesaiPenilaian" label="Bulan Selesai Penilaian">
          <InputNumber />
        </Form.Item>
        <Form.Item name="hasilKinerjaNilai" label="Hasil Kinerja Nilai">
          <InputNumber />
        </Form.Item>
        <Form.Item name="koefisienId" label="Koefisien ID">
          <Input />
        </Form.Item>
        <Form.Item name="kuadranKinerjaNilai" label="Kuadran Kinerja Nilai">
          <InputNumber />
        </Form.Item>
        <Form.Item name="perilakuKerjaNilai" label="Perilaku Kerja Nilai">
          <InputNumber />
        </Form.Item>
        <Form.Item name="tahun" label="Tahun">
          <InputNumber />
        </Form.Item>
        <Form.Item name="tahunMulaiPenilaian" label="Tahun Mulai Penilaian">
          <InputNumber />
        </Form.Item>
        <Form.Item name="tahunSelesaiPenilaian" label="Tahun Selesai Penilaian">
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function CreateKinerjaPeriodik() {
  const [visible, setVisible] = useState(false);

  const handleOpen = () => {
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Button onClick={handleOpen}>Tambah Kinerja Periodik</Button>
      <ModalCreate visible={visible} onClose={handleClose} />
    </>
  );
}

export default CreateKinerjaPeriodik;

import { Button, Form, Input, Modal, Select, message, Space } from "antd";
import { DatePicker } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useFileStore from "@/store/useFileStore";

import dayjs from "dayjs";

import FileUploadSIASN from "./FileUploadSIASN";
import {
  createSertifikasiByNip,
  findLembagaSertifikasi,
  findRumpunJabatanJf,
} from "@/services/siasn-services";
const FORMAT = "DD-MM-YYYY";

/**{
  "gelarBelakangSert": "string",
  "gelarDepanSert": "string",
  "id": "string",
  "lembagaSertifikasiId": "string",
  "lembagaSertifikasiNama": "string",
  "masaBerlakuSertMulai": "string",
  "masaBerlakuSertSelasai": "string",
  "namaSertifikasi": "string",
  "nomorSertifikat": "string",
  "path": [
    {
      "dok_id": "string",
      "dok_nama": "string",
      "dok_uri": "string",
      "object": "string",
      "slug": "string"
    }
  ],
  "pnsOrangId": "string",
  "rumpunJabatanId": "string",
  "tanggalSertifikat": "string"
} */

const ModalCreateSertifikasi = ({ nip, open, onCancel }) => {
  const queryClient = useQueryClient();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const fileList = useFileStore((state) => state.fileList);

  const { data: refLembagaSertifikasi } = useQuery({
    queryKey: ["refLembagaSertifikasi"],
    queryFn: () => findLembagaSertifikasi(),
  });

  const { data: refRumpunJabatan } = useQuery({
    queryKey: ["refRumpunJabatan"],
    queryFn: () => findRumpunJabatanJf(),
  });

  const { mutateAsync: postRwSertifikasi, isLoading: isPosting } = useMutation({
    mutationFn: (data) => createSertifikasiByNip(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sertifikasi", nip] });
      message.success("Sertifikasi berhasil ditambahkan");
    },
    onError: () => {
      message.error("Gagal menambahkan sertifikasi");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sertifikasi", nip] });
    },
  });

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      masaBerlakuSertMulai: dayjs(values.masaBerlakuSertMulai).format(FORMAT),
      masaBerlakuSertSelasai: dayjs(values.masaBerlakuSertSelasai).format(
        FORMAT
      ),
      tanggalSertifikat: dayjs(values.tanggalSertifikat).format(FORMAT),
    };

    await postRwSertifikasi({ nip, data: payload });
  };

  return (
    <Modal
      width={900}
      title="Tambah Sertifikasi SIASN"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Batal
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isPosting}
          onClick={handleSubmit}
        >
          Simpan
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          pnsOrangId: nip,
        }}
      >
        <FileUploadSIASN />

        <Space.Compact block style={{ marginBottom: 16 }}>
          <Form.Item
            label="Gelar Depan"
            name="gelarDepanSert"
            style={{ width: "50%", marginRight: 8 }}
          >
            <Input placeholder="Dr., Prof., dll" />
          </Form.Item>
          <Form.Item
            label="Gelar Belakang"
            name="gelarBelakangSert"
            style={{ width: "50%" }}
          >
            <Input placeholder="S.Kom., M.T., dll" />
          </Form.Item>
        </Space.Compact>

        <Form.Item
          label="Nama Sertifikasi"
          name="namaSertifikasi"
          rules={[{ required: true, message: "Nama sertifikasi harus diisi!" }]}
        >
          <Input placeholder="Masukkan nama sertifikasi" />
        </Form.Item>

        <Form.Item
          label="Nomor Sertifikat"
          name="nomorSertifikat"
          rules={[{ required: true, message: "Nomor sertifikat harus diisi!" }]}
        >
          <Input placeholder="Masukkan nomor sertifikat" />
        </Form.Item>

        <Form.Item
          label="Lembaga Sertifikasi"
          name="lembagaSertifikasiId"
          rules={[
            { required: true, message: "Lembaga sertifikasi harus diisi!" },
          ]}
        >
          <Select
            showSearch
            optionFilterProp="name"
            placeholder="Pilih lembaga sertifikasi"
          >
            {refLembagaSertifikasi?.map((item) => (
              <Select.Option name={item.nama} key={item.id} value={item.id}>
                {item.nama}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Rumpun Jabatan" name="rumpunJabatanId">
          <Select
            showSearch
            optionFilterProp="name"
            placeholder="Pilih rumpun jabatan"
          >
            {refRumpunJabatan?.map((item) => (
              <Select.Option name={item.nama} key={item.id} value={item.id}>
                {item.nama}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Tanggal Sertifikat"
          name="tanggalSertifikat"
          rules={[
            { required: true, message: "Tanggal sertifikat harus diisi!" },
          ]}
        >
          <DatePicker
            format={FORMAT}
            style={{ width: "100%" }}
            placeholder="Pilih tanggal sertifikat"
          />
        </Form.Item>

        <Space.Compact block>
          <Form.Item
            label="Masa Berlaku Mulai"
            name="masaBerlakuSertMulai"
            style={{ width: "50%", marginRight: 8 }}
            rules={[
              { required: true, message: "Masa berlaku mulai harus diisi!" },
            ]}
          >
            <DatePicker
              format={FORMAT}
              style={{ width: "100%" }}
              placeholder="Pilih tanggal mulai"
            />
          </Form.Item>
          <Form.Item
            label="Masa Berlaku Selesai"
            name="masaBerlakuSertSelasai"
            style={{ width: "50%" }}
            rules={[
              { required: true, message: "Masa berlaku selesai harus diisi!" },
            ]}
          >
            <DatePicker
              format={FORMAT}
              style={{ width: "100%" }}
              placeholder="Pilih tanggal selesai"
            />
          </Form.Item>
        </Space.Compact>
      </Form>
    </Modal>
  );
};

const CreateSertifikasiSIASN = () => {
  const router = useRouter();
  const nip = router.query.nip;

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleOpen}>Tambah Sertifikasi</Button>
      <ModalCreateSertifikasi nip={nip} open={open} onCancel={handleCancel} />
    </>
  );
};

export default CreateSertifikasiSIASN;

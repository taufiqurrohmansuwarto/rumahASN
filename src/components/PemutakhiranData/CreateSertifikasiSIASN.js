import useFileStore from "@/store/useFileStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
} from "antd";
import { useEffect, useState } from "react";

import dayjs from "dayjs";

import {
  createSertifikasiByNip,
  findLembagaSertifikasi,
  findRumpunJabatan,
  uploadDokRiwayat,
} from "@/services/siasn-services";
import FileUploadSIASN from "./FileUploadSIASN";
import { urlToPdf } from "@/services/master.services";
import Icon, { FilePdfOutlined } from "@ant-design/icons";
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

const ModalCreateSertifikasi = ({
  nip,
  open,
  onCancel,
  row = null,
  type = "create",
}) => {
  const queryClient = useQueryClient();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const { data: refLembagaSertifikasi } = useQuery({
    queryKey: ["refLembagaSertifikasi"],
    queryFn: () => findLembagaSertifikasi(),
  });

  const { data: refRumpunJabatan } = useQuery({
    queryKey: ["refRumpunJabatan"],
    queryFn: () => findRumpunJabatan(),
  });

  const { mutateAsync: postRwSertifikasi, isLoading: isPosting } = useMutation({
    mutationFn: (data) => createSertifikasiByNip(data),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["sertifikasi", nip] });
      message.success(data?.message);
      onCancel();
    },
    onError: () => {
      message.error("Gagal menambahkan sertifikasi");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sertifikasi", nip] });
    },
  });

  useEffect(() => {
    if (row) {
      form.setFieldsValue({
        tanggalSertifikat: row?.tgl_sk ? dayjs(row?.tgl_sk, FORMAT) : null,
        nomorSertifikat: row?.no_sk || null,
      });
    }
  }, [row, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        masaBerlakuSertMulai: dayjs(values.masaBerlakuSertMulai).format(FORMAT),
        masaBerlakuSertSelasai: dayjs(values.masaBerlakuSertSelasai).format(
          FORMAT
        ),
        tanggalSertifikat: dayjs(values.tanggalSertifikat).format(FORMAT),
      };

      const result = await postRwSertifikasi({ nip, data: payload });
      const id = result?.id;
      if (id) {
        const currentFile = await urlToPdf({ url: row?.file_kompetensi });
        const file = new File([currentFile], "file.pdf", {
          type: "application/pdf",
        });
        console.log({ file, id });
        const formData = new FormData();
        formData.append("file", file);
        formData.append("id_ref_dokumen", 1680);
        formData.append("id_riwayat", id);
        await uploadDokRiwayat(formData);
        queryClient.invalidateQueries({ queryKey: ["sertifikasi", nip] });
      }

      // const currentFile = await urlToPdf({ url: row?.file_kompetensi });
      // const file = new File([currentFile], "file.pdf", {
      //   type: "application/pdf",
      // });
      // console.log(file);
    } catch (error) {
      message.error("Gagal menambahkan sertifikasi file kompetensi");
      queryClient.invalidateQueries({ queryKey: ["sertifikasi", nip] });
    }
  };

  return (
    <Modal
      centered
      width={900}
      title={
        type === "create"
          ? "Tambah Sertifikasi SIASN"
          : "Transfer Sertifikasi SIASN"
      }
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
        {type === "create" && <FileUploadSIASN />}
        {row?.file_kompetensi && (
          <a href={row?.file_kompetensi} target="_blank" rel="noreferrer">
            <Button type="link" icon={<FilePdfOutlined />}>
              Lihat File
            </Button>
          </a>
        )}

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
            disabled={type === "transfer"}
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

const CreateSertifikasiSIASN = ({ nip, row = null, type = "create" }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Button onClick={handleOpen}>
        {type === "create" ? "Tambah Sertifikasi" : "Transfer Sertifikasi"}
      </Button>
      <ModalCreateSertifikasi
        nip={nip}
        open={open}
        onCancel={handleCancel}
        row={row}
        type={type}
      />
    </>
  );
};

export default CreateSertifikasiSIASN;

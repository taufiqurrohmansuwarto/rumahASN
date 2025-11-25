import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
  Row,
  Col,
} from "antd";
import { Text, Stack, Flex } from "@mantine/core";
import {
  IconPlus,
  IconCertificate,
  IconFileText,
  IconCalendar,
  IconBuilding,
  IconBriefcase,
  IconAward,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { urlToPdf } from "@/services/master.services";
import {
  createRwSertifikasiPersonal,
  findLembagaSertifikasi,
  findRumpunJabatan,
  uploadDokRiwayat,
} from "@/services/siasn-services";
import FileUploadSIASN from "./FileUploadSIASN";
import useFileStore from "@/store/useFileStore";

const FORMAT = "DD-MM-YYYY";

const ModalCreateSertifikasi = ({
  nip,
  open,
  onCancel,
  row = null,
  type = "create",
}) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const fileList = useFileStore((state) => state.fileList);

  const { data: refLembagaSertifikasi } = useQuery({
    queryKey: ["refLembagaSertifikasi"],
    queryFn: () => findLembagaSertifikasi(),
  });

  const { data: refRumpunJabatan } = useQuery({
    queryKey: ["refRumpunJabatan"],
    queryFn: () => findRumpunJabatan(),
  });

  const { mutateAsync: postRwSertifikasi, isLoading: isPosting } = useMutation({
    mutationFn: (data) => createRwSertifikasiPersonal(data),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["sertifikasi-personal"] });
      message.success(data?.message);
      onCancel();
    },
    onError: () => {
      message.error("Gagal menambahkan sertifikasi");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["sertifikasi-personal"] });
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

      const result = await postRwSertifikasi(payload);
      const id = result?.id;

      const currentFile = fileList[0]?.originFileObj;

      if (type === "create" && currentFile) {
        const formData = new FormData();
        formData.append("file", currentFile);
        formData.append("id_ref_dokumen", 1683);
        formData.append("id_riwayat", id);
        await uploadDokRiwayat(formData);
        queryClient.invalidateQueries({ queryKey: ["sertifikasi-personal"] });
      } else if (type === "transfer" && row?.file_kompetensi) {
        const currentFile = await urlToPdf({ url: row?.file_kompetensi });
        const file = new File([currentFile], "file.pdf", {
          type: "application/pdf",
        });
        const formData = new FormData();
        formData.append("file", file);
        formData.append("id_ref_dokumen", 1683);
        formData.append("id_riwayat", id);
        await uploadDokRiwayat(formData);
        queryClient.invalidateQueries({ queryKey: ["sertifikasi-personal"] });
      }

      if (id && row?.file_kompetensi) {
        const currentFile = await urlToPdf({ url: row?.file_kompetensi });
        const file = new File([currentFile], "file.pdf", {
          type: "application/pdf",
        });
        const formData = new FormData();
        formData.append("file", file);
        formData.append("id_ref_dokumen", 1683);
        formData.append("id_riwayat", id);
        await uploadDokRiwayat(formData);
        queryClient.invalidateQueries({ queryKey: ["sertifikasi-personal"] });
      }
    } catch (error) {
      message.error("Gagal menambahkan sertifikasi");
      queryClient.invalidateQueries({ queryKey: ["sertifikasi-personal"] });
    }
  };

  return (
    <Modal
      centered
      width={700}
      title={
        <Flex align="center" gap={8}>
          <IconCertificate size={18} />
          <Text size="sm" fw={600}>
            {type === "create" ? "Tambah Sertifikasi" : "Transfer Sertifikasi"}
          </Text>
        </Flex>
      }
      open={open}
      onCancel={onCancel}
      footer={
        <Flex justify="end" gap={8}>
          <Button onClick={onCancel}>Batal</Button>
          <Button type="primary" loading={isPosting} onClick={handleSubmit}>
            Simpan
          </Button>
        </Flex>
      }
    >
      <Form
        form={form}
        layout="vertical"
        size="small"
        initialValues={{ pnsOrangId: nip }}
      >
        <Stack spacing={12}>
          {/* File Upload */}
          {type === "create" && <FileUploadSIASN />}
          {row?.file_kompetensi && (
            <Button
              size="small"
              type="link"
              icon={<IconFileText size={14} />}
              href={row?.file_kompetensi}
              target="_blank"
              style={{ padding: 0, height: "auto" }}
            >
              Lihat File
            </Button>
          )}

          {/* Gelar */}
          <div>
            <Flex align="center" gap={6} mb={8}>
              <IconAward size={14} />
              <Text size="xs" fw={600}>
                Gelar
              </Text>
            </Flex>
            <Row gutter={[12, 8]}>
              <Col span={12}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Gelar Depan
                </Text>
                <Form.Item name="gelarDepanSert" style={{ marginBottom: 0 }}>
                  <Input
                    size="small"
                    placeholder="Dr., Prof., dll"
                    prefix={<IconAward size={14} />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Gelar Belakang
                </Text>
                <Form.Item name="gelarBelakangSert" style={{ marginBottom: 0 }}>
                  <Input
                    size="small"
                    placeholder="S.Kom., M.T., dll"
                    prefix={<IconAward size={14} />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Informasi Sertifikasi */}
          <div>
            <Flex align="center" gap={6} mb={8}>
              <IconCertificate size={14} />
              <Text size="xs" fw={600}>
                Informasi Sertifikasi
              </Text>
            </Flex>
            <Row gutter={[12, 8]}>
              <Col span={16}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Nama Sertifikasi
                </Text>
                <Form.Item
                  name="namaSertifikasi"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    size="small"
                    placeholder="Nama sertifikasi"
                    prefix={<IconCertificate size={14} />}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Nomor Sertifikat
                </Text>
                <Form.Item
                  name="nomorSertifikat"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    size="small"
                    placeholder="Nomor"
                    prefix={<IconFileText size={14} />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Lembaga & Rumpun */}
          <div>
            <Flex align="center" gap={6} mb={8}>
              <IconBuilding size={14} />
              <Text size="xs" fw={600}>
                Lembaga & Rumpun
              </Text>
            </Flex>
            <Row gutter={[12, 8]}>
              <Col span={12}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Lembaga Sertifikasi
                </Text>
                <Form.Item
                  name="lembagaSertifikasiId"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    size="small"
                    showSearch
                    optionFilterProp="name"
                    placeholder="Pilih lembaga"
                  >
                    {refLembagaSertifikasi?.map((item) => (
                      <Select.Option
                        name={item.nama}
                        key={item.id}
                        value={item.id}
                      >
                        {item.nama}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Rumpun Jabatan
                </Text>
                <Form.Item name="rumpunJabatanId" style={{ marginBottom: 0 }}>
                  <Select
                    size="small"
                    showSearch
                    optionFilterProp="name"
                    placeholder="Pilih rumpun"
                    allowClear
                  >
                    {refRumpunJabatan?.map((item) => (
                      <Select.Option
                        name={item.nama}
                        key={item.id}
                        value={item.id}
                      >
                        {item.nama}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Tanggal */}
          <div>
            <Flex align="center" gap={6} mb={8}>
              <IconCalendar size={14} />
              <Text size="xs" fw={600}>
                Tanggal & Masa Berlaku
              </Text>
            </Flex>
            <Row gutter={[12, 8]}>
              <Col span={8}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Tanggal Sertifikat
                </Text>
                <Form.Item
                  name="tanggalSertifikat"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    size="small"
                    disabled={type === "transfer"}
                    format={FORMAT}
                    style={{ width: "100%" }}
                    placeholder="Pilih tanggal"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Masa Berlaku Mulai
                </Text>
                <Form.Item
                  name="masaBerlakuSertMulai"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    size="small"
                    format={FORMAT}
                    style={{ width: "100%" }}
                    placeholder="Mulai"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Masa Berlaku Selesai
                </Text>
                <Form.Item
                  name="masaBerlakuSertSelasai"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    size="small"
                    format={FORMAT}
                    style={{ width: "100%" }}
                    placeholder="Selesai"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Stack>
      </Form>
    </Modal>
  );
};

const CreateSertifikasiPersonal = ({ row = null, type = "create" }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="small"
        type="primary"
        onClick={() => setOpen(true)}
        icon={<IconPlus size={14} />}
        style={{ marginBottom: 10 }}
      >
        {type === "create" ? "Tambah" : "Transfer"}
      </Button>
      <ModalCreateSertifikasi
        open={open}
        onCancel={() => setOpen(false)}
        row={row}
        type={type}
      />
    </>
  );
};

export default CreateSertifikasiPersonal;

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
  IconAward,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { urlToPdf } from "@/services/master.services";
import {
  createSertifikasiByNip,
  findLembagaSertifikasi,
  findRumpunJabatan,
  uploadDokRiwayat,
} from "@/services/siasn-services";
import FileUploadSIASN from "./FileUploadSIASN";

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
        queryClient.invalidateQueries({ queryKey: ["sertifikasi", nip] });
      }
    } catch (error) {
      message.error("Gagal menambahkan sertifikasi");
      queryClient.invalidateQueries({ queryKey: ["sertifikasi", nip] });
    }
  };

  return (
    <Modal
      centered
      width={750}
      title={
        <Flex align="center" gap={8}>
          <IconCertificate size={20} />
          <Text size="md" fw={600}>
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
      <Form form={form} layout="vertical" initialValues={{ pnsOrangId: nip }}>
        <Stack spacing={16}>
          {/* File Upload */}
          {type === "create" && <FileUploadSIASN />}
          {row?.file_kompetensi && (
            <Button
              type="link"
              icon={<IconFileText size={16} />}
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
              <IconAward size={16} />
              <Text size="sm" fw={600}>
                Gelar
              </Text>
            </Flex>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text
                  size="sm"
                  fw={500}
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Gelar Depan
                </Text>
                <Form.Item name="gelarDepanSert" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="Dr., Prof., dll"
                    prefix={<IconAward size={16} />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Text
                  size="sm"
                  fw={500}
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Gelar Belakang
                </Text>
                <Form.Item name="gelarBelakangSert" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="S.Kom., M.T., dll"
                    prefix={<IconAward size={16} />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Informasi Sertifikasi */}
          <div>
            <Flex align="center" gap={6} mb={8}>
              <IconCertificate size={16} />
              <Text size="sm" fw={600}>
                Informasi Sertifikasi
              </Text>
            </Flex>
            <Row gutter={[16, 12]}>
              <Col span={16}>
                <Text
                  size="sm"
                  fw={500}
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Nama Sertifikasi
                </Text>
                <Form.Item
                  name="namaSertifikasi"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    placeholder="Nama sertifikasi"
                    prefix={<IconCertificate size={16} />}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Text
                  size="sm"
                  fw={500}
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Nomor Sertifikat
                </Text>
                <Form.Item
                  name="nomorSertifikat"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    placeholder="Nomor"
                    prefix={<IconFileText size={16} />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Lembaga & Rumpun */}
          <div>
            <Flex align="center" gap={6} mb={8}>
              <IconBuilding size={16} />
              <Text size="sm" fw={600}>
                Lembaga & Rumpun
              </Text>
            </Flex>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text
                  size="sm"
                  fw={500}
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Lembaga Sertifikasi
                </Text>
                <Form.Item
                  name="lembagaSertifikasiId"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Select
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
                  size="sm"
                  fw={500}
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Rumpun Jabatan
                </Text>
                <Form.Item name="rumpunJabatanId" style={{ marginBottom: 0 }}>
                  <Select
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
              <IconCalendar size={16} />
              <Text size="sm" fw={600}>
                Tanggal & Masa Berlaku
              </Text>
            </Flex>
            <Row gutter={[16, 12]}>
              <Col span={8}>
                <Text
                  size="sm"
                  fw={500}
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Tanggal Sertifikat
                </Text>
                <Form.Item
                  name="tanggalSertifikat"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    disabled={type === "transfer"}
                    format={FORMAT}
                    style={{ width: "100%" }}
                    placeholder="Pilih tanggal"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Text
                  size="sm"
                  fw={500}
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Masa Berlaku Mulai
                </Text>
                <Form.Item
                  name="masaBerlakuSertMulai"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    format={FORMAT}
                    style={{ width: "100%" }}
                    placeholder="Mulai"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Text
                  size="sm"
                  fw={500}
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Masa Berlaku Selesai
                </Text>
                <Form.Item
                  name="masaBerlakuSertSelasai"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
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

const CreateSertifikasiSIASN = ({ nip, row = null, type = "create" }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="primary"
        onClick={() => setOpen(true)}
        icon={<IconPlus size={16} />}
        style={{ marginBottom: 10 }}
      >
        {type === "create" ? "Tambah Sertifikasi" : "Transfer Sertifikasi"}
      </Button>
      <ModalCreateSertifikasi
        nip={nip}
        open={open}
        onCancel={() => setOpen(false)}
        row={row}
        type={type}
      />
    </>
  );
};

export default CreateSertifikasiSIASN;

import { submitUsulanPeremajaanPendidikan } from "@/services/admin.services";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
} from "antd";
import { Text, Stack } from "@mantine/core";
import { IconTrash, IconKey, IconLock, IconArrowLeft } from "@tabler/icons-react";
import { useState, useEffect } from "react";

const ModalHapusPendidikan = ({ open, row, onCancel, usulanId }) => {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1); // 1: Form Hapus, 2: Konfirmasi
  const [step1Values, setStep1Values] = useState(null); // State untuk menyimpan values step 1

  // Reset step saat modal dibuka/ditutup
  useEffect(() => {
    if (open) {
      setStep(1);
      setStep1Values(null);
      form.resetFields();
    }
  }, [open, form]);

  const { mutate: submit, isLoading: submitLoading } = useMutation(
    (data) => submitUsulanPeremajaanPendidikan(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus pendidikan");
        setStep(1);
        onCancel();
      },
      onError: (error) => {
        const messageError =
          error?.response?.data?.error || "Internal server error";
        message.error(messageError);
      },
    }
  );

  // Helper function untuk mengubah null/empty menjadi "-"
  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    return value;
  };

  // Helper function untuk boolean conversion
  const formatBoolean = (value) => {
    const result = value === true || value === "1" || value === 1;
    return result;
  };

  // Format data untuk form dengan null values diubah menjadi "-"
  const formattedData = row
    ? {
        ...row,
        nipBaru: formatValue(row.nipBaru),
        nipLama: formatValue(row.nipLama),
        tkPendidikanNama: formatValue(row.tkPendidikanNama),
        pendidikanNama: formatValue(row.pendidikanNama),
        tahunLulus: formatValue(row.tahunLulus),
        tglLulus: formatValue(row.tglLulus),
        nomorIjasah: formatValue(row.nomorIjasah),
        namaSekolah: formatValue(row.namaSekolah),
        gelarDepan: formatValue(row.gelarDepan),
        gelarBelakang: formatValue(row.gelarBelakang),
        path: formatValue(row.path),
      }
    : {};

  // Handler untuk lanjut ke step 2
  const handleNext = async () => {
    try {
      const values = await form.validateFields(["keterangan"]);
      // Simpan semua values dari step 1 (termasuk field disabled)
      setStep1Values({
        ...formattedData,
        keterangan: values.keterangan
      });
      setStep(2);
    } catch (error) {
      message.error("Lengkapi alasan penghapusan terlebih dahulu");
    }
  };

  // Handler untuk kembali ke step 1
  const handleBack = () => {
    setStep(1);
  };

  // Handler untuk submit final
  const handleSubmit = async () => {
    try {
      const step2Values = await form.validateFields(['passphrase', 'one_time_code']);
      
      // Gabungkan values dari step 1 dan step 2
      const allValues = { ...step1Values, ...step2Values };

      const payload = {
        usulan_id: usulanId,
        tipe: "D",
        pns_orang_id: row?.idPns,
        id_riwayat: row?.id,
        tahun_lulus: allValues?.tahunLulus || "",
        nomor_ijazah: allValues?.nomorIjasah || "",
        nama_sek: allValues?.namaSekolah || "",
        glr_depan: allValues?.gelarDepan || "",
        glr_belakang: allValues?.gelarBelakang || "",
        tgl_tahun_lulus: allValues?.tglLulus || "",
        pendidikan_id: row?.pendidikanId,
        pendidikan_nama: row?.pendidikanNama || "",
        is_pendidikan_pertama: row?.isPendidikanPertama,
        pencantuman_gelar: allValues?.pencantumanGelar || "",
        tingkat_pendidikan_id: row?.tkPendidikanId || "",
        tingkat_pendidikan_nama: row?.tkPendidikanNama || "",
        dok_transkrip_nilai: null,
        dok_ijazah: null,
        dok_sk_pencantuman_gelar: null,
        keterangan: allValues?.keterangan || "",
        passphrase: step2Values?.passphrase || "",
        one_time_code: step2Values?.one_time_code || "",
      };

      submit(payload);
    } catch (error) {
      message.error("Lengkapi passphrase dan OTP");
    }
  };

  return (
    <Modal
      title={
        <Space>
          <IconTrash size={18} />
          <span>
            {step === 1 ? "Hapus Usulan Pendidikan" : "Konfirmasi Penghapusan"}
          </span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      width={550}
      centered
      footer={
        step === 1 ? (
          <Space>
            <Button onClick={onCancel}>Batal</Button>
            <Button type="primary" danger onClick={handleNext}>
              Lanjut
            </Button>
          </Space>
        ) : (
          <Space>
            <Button icon={<IconArrowLeft size={14} />} onClick={handleBack}>
              Kembali
            </Button>
            <Button
              type="primary"
              danger
              loading={submitLoading}
              onClick={handleSubmit}
            >
              Hapus
            </Button>
          </Space>
        )
      }
    >
      <Stack spacing="xs" style={{ marginBottom: 12 }}>
        <Text size="xs" c="dimmed">
          ID: {usulanId}
        </Text>
      </Stack>

      <Form
        form={form}
        layout="vertical"
        initialValues={formattedData}
        size="small"
      >
        {step === 1 ? (
          <>
            {/* Step 1: Form Hapus */}
            <Row gutter={12}>
              <Col span={10}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  NIP
                </Text>
                <Form.Item name="nipBaru" style={{ marginBottom: 0 }}>
                  <Input disabled size="small" />
                </Form.Item>
              </Col>
              <Col span={14}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Pendidikan
                </Text>
                <Form.Item name="pendidikanNama" style={{ marginBottom: 0 }}>
                  <Input disabled size="small" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12} style={{ marginTop: 8 }}>
              <Col span={18}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Sekolah
                </Text>
                <Form.Item name="namaSekolah" style={{ marginBottom: 0 }}>
                  <Input disabled size="small" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Tahun
                </Text>
                <Form.Item name="tahunLulus" style={{ marginBottom: 0 }}>
                  <Input disabled size="small" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 12, marginTop: 8 }}>
              <Checkbox
                disabled
                checked={formatBoolean(row?.isPendidikanPertama)}
              >
                <Text size="xs">Pendidikan Pertama</Text>
              </Checkbox>
            </Form.Item>

            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Alasan Penghapusan
            </Text>
            <Form.Item
              required
              name="keterangan"
              rules={[{ required: true, message: "Wajib diisi" }]}
              style={{ marginBottom: 0 }}
            >
              <Input.TextArea
                rows={3}
                placeholder="Jelaskan alasan penghapusan..."
              />
            </Form.Item>
          </>
        ) : (
          <>
            {/* Step 2: Konfirmasi dengan Passphrase & OTP */}
            <Stack spacing="md">
              <Text size="sm" c="dimmed">
                Masukkan passphrase dan OTP untuk menghapus usulan pendidikan
              </Text>

              <div>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Passphrase
                </Text>
                <Form.Item
                  name="passphrase"
                  rules={[
                    { required: true, message: "Passphrase wajib diisi" },
                  ]}
                  style={{ marginBottom: 12 }}
                >
                  <Input.Password
                    size="small"
                    placeholder="Passphrase SIASN"
                    autoComplete="off"
                    prefix={<IconKey size={14} />}
                  />
                </Form.Item>
              </div>

              <div>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  One Time Code (OTP)
                </Text>
                <Form.Item
                  name="one_time_code"
                  rules={[{ required: true, message: "OTP wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    size="small"
                    placeholder="Kode OTP"
                    autoComplete="off"
                    prefix={<IconLock size={14} />}
                  />
                </Form.Item>
              </div>
            </Stack>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default ModalHapusPendidikan;


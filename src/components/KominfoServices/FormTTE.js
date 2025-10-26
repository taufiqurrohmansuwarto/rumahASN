import { usePengajuanTTEById } from "@/hooks/kominfo-submissions";
import {
  Card as AntdCard,
  Spin,
  Result,
  Button,
  Form,
  Input,
  Upload,
  message as antdMessage,
  Divider,
} from "antd";
import { Text, Stack, Alert, Badge, Group } from "@mantine/core";
import {
  IconCertificate,
  IconAlertCircle,
  IconCircleCheck,
  IconUser,
  IconMail,
  IconId,
  IconUpload,
  IconFile,
  IconFileText,
  IconNote,
} from "@tabler/icons-react";
import { UploadOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

function FormTTE({ pengajuanId }) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [fileKTP, setFileKTP] = useState([]);
  const [fileSKJabatan, setFileSKJabatan] = useState([]);
  const [fileSuratUsulan, setFileSuratUsulan] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, error, refetch } = usePengajuanTTEById(pengajuanId);

  // Check if form is editable (DRAFT or PERBAIKAN)
  const isEditable = data?.status === "DRAFT" || data?.status === "PERBAIKAN";

  if (isLoading) {
    return (
      <AntdCard>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <Text size="sm" c="dimmed" mt="md">
            Memuat data pengajuan...
          </Text>
        </div>
      </AntdCard>
    );
  }

  if (error) {
    return (
      <AntdCard>
        <Result
          status="error"
          title="Gagal Memuat Data"
          subTitle="Terjadi kesalahan saat memuat data pengajuan TTE."
          extra={
            <Button
              type="primary"
              onClick={() => router.push("/kominfo-services/tte")}
            >
              Kembali
            </Button>
          }
        />
      </AntdCard>
    );
  }

  // Upload props configuration
  const uploadProps = {
    beforeUpload: (file) => {
      const isValidSize = file.size / 1024 / 1024 < 5; // Max 5MB
      if (!isValidSize) {
        antdMessage.error("Ukuran file maksimal 5MB!");
        return Upload.LIST_IGNORE;
      }
      return false; // Prevent auto upload
    },
    maxCount: 1,
  };

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      // TODO: Implement submit logic with file uploads
      console.log("Form values:", values);
      console.log("KTP:", fileKTP);
      console.log("SK Jabatan:", fileSKJabatan);
      console.log("Surat Usulan:", fileSuratUsulan);

      antdMessage.success("Pengajuan TTE berhasil disubmit!");
      await refetch();
    } catch (error) {
      antdMessage.error("Gagal submit pengajuan TTE");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AntdCard
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#6366f1",
            color: "white",
            padding: 20,
            borderRadius: "12px 12px 0 0",
            margin: "-24px -24px 0 -24px",
          }}
        >
          <Group justify="space-between" align="center">
            <div>
              <Group gap={8} mb={4}>
                <IconCertificate size={20} />
                <Text fw={600} size="lg" style={{ color: "white" }}>
                  Pengajuan Tanda Tangan Elektronik
                </Text>
              </Group>
              <Text size="sm" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                ID Pengajuan: {pengajuanId || "-"}
              </Text>
            </div>
            <Badge
              color={
                data?.status === "DRAFT"
                  ? "yellow"
                  : data?.status === "PERBAIKAN"
                  ? "orange"
                  : data?.status === "DIAJUKAN"
                  ? "blue"
                  : data?.status === "DISETUJUI"
                  ? "green"
                  : "red"
              }
              size="lg"
              variant="filled"
            >
              {data?.status || "DRAFT"}
            </Badge>
          </Group>
        </div>

        <Stack gap="md" mt="md">
          {/* Catatan Admin - Show if exists */}
          {data?.catatan && (
            <Alert
              icon={<IconNote />}
              color={data?.status === "PERBAIKAN" ? "orange" : "blue"}
              variant="light"
              styles={{
                root: {
                  borderRadius: 8,
                },
              }}
            >
              <Text size="sm" fw={600} mb={4}>
                Catatan Admin:
              </Text>
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {data.catatan}
              </Text>
            </Alert>
          )}

          {/* Form Pengajuan TTE */}
          <AntdCard title="Formulir Pengajuan TTE">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                nip: data?.nip,
                nik: data?.nik,
                email_jatimprov: data?.email_jatimprov,
              }}
            >
              <Form.Item
                label="NIP (Nomor Induk Pegawai)"
                name="nip"
                rules={[{ required: true, message: "NIP wajib diisi" }]}
              >
                <Input
                  prefix={<IconUser size={16} />}
                  disabled
                  style={{ fontFamily: "monospace" }}
                />
              </Form.Item>

              <Form.Item
                label="NIK (Nomor Induk Kependudukan)"
                name="nik"
                rules={[{ required: true, message: "NIK wajib diisi" }]}
              >
                <Input
                  prefix={<IconId size={16} />}
                  disabled
                  style={{ fontFamily: "monospace" }}
                />
              </Form.Item>

              <Form.Item
                label="Email Jatimprov"
                name="email_jatimprov"
                rules={[
                  { required: true, message: "Email Jatimprov wajib diisi" },
                ]}
              >
                <Input
                  prefix={<IconMail size={16} />}
                  disabled
                  style={{ fontFamily: "monospace" }}
                />
              </Form.Item>

              <Divider orientation="left">
                <Text size="sm" c="dimmed">
                  Upload Dokumen
                </Text>
              </Divider>

              <Text size="xs" c="dimmed" mb="sm">
                Format: JPG, PNG, PDF • Maksimal 5MB per file
              </Text>

              <Form.Item
                label="Upload KTP"
                name="ktp"
                rules={[
                  {
                    required: isEditable,
                    message: "Upload KTP wajib dilampirkan",
                  },
                ]}
                help={
                  <Text size="xs" c="dimmed">
                    Foto/scan KTP berwarna, jelas terbaca, dan tidak blur
                  </Text>
                }
              >
                <Upload
                  {...uploadProps}
                  fileList={fileKTP}
                  onChange={({ fileList }) => setFileKTP(fileList)}
                  accept=".jpg,.jpeg,.png,.pdf"
                  disabled={!isEditable}
                >
                  <Button
                    icon={<UploadOutlined />}
                    disabled={!isEditable}
                    style={{ width: "100%" }}
                  >
                    {fileKTP.length > 0 ? "Ganti File KTP" : "Pilih File KTP"}
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item
                label="Upload SK Jabatan"
                name="sk_jabatan"
                rules={[
                  {
                    required: isEditable,
                    message: "Upload SK Jabatan wajib dilampirkan",
                  },
                ]}
                help={
                  <Text size="xs" c="dimmed">
                    Scan SK jabatan terbaru yang masih berlaku, tulisan jelas
                    terbaca
                  </Text>
                }
              >
                <Upload
                  {...uploadProps}
                  fileList={fileSKJabatan}
                  onChange={({ fileList }) => setFileSKJabatan(fileList)}
                  accept=".jpg,.jpeg,.png,.pdf"
                  disabled={!isEditable}
                >
                  <Button
                    icon={<UploadOutlined />}
                    disabled={!isEditable}
                    style={{ width: "100%" }}
                  >
                    {fileSKJabatan.length > 0
                      ? "Ganti File SK Jabatan"
                      : "Pilih File SK Jabatan"}
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item
                label="Upload Surat Usulan TTE"
                name="surat_usulan"
                rules={[
                  {
                    required: isEditable,
                    message: "Upload Surat Usulan TTE wajib dilampirkan",
                  },
                ]}
                help={
                  <Text size="xs" c="dimmed">
                    Surat usulan bermaterai dari instansi, scan jelas dan dapat
                    dibaca
                  </Text>
                }
              >
                <Upload
                  {...uploadProps}
                  fileList={fileSuratUsulan}
                  onChange={({ fileList }) => setFileSuratUsulan(fileList)}
                  accept=".jpg,.jpeg,.png,.pdf"
                  disabled={!isEditable}
                >
                  <Button
                    icon={<UploadOutlined />}
                    disabled={!isEditable}
                    style={{ width: "100%" }}
                  >
                    {fileSuratUsulan.length > 0
                      ? "Ganti File Surat Usulan"
                      : "Pilih File Surat Usulan"}
                  </Button>
                </Upload>
              </Form.Item>

              {/* Submit Button - Only show if status is DRAFT or PERBAIKAN */}
              {isEditable && (
                <>
                  <Divider />
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Group justify="flex-end" gap="sm">
                      <Button
                        onClick={() => router.push("/kominfo-services/tte")}
                      >
                        Batal
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSubmitting}
                        style={{
                          background: "#6366f1",
                          borderColor: "#6366f1",
                        }}
                      >
                        Submit Pengajuan
                      </Button>
                    </Group>
                  </Form.Item>
                </>
              )}
            </Form>
          </AntdCard>
        </Stack>
      </AntdCard>
    </>
  );
}

export default FormTTE;

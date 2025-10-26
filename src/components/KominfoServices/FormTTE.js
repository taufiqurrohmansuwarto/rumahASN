import {
  usePengajuanTTEById,
  useSubmitPengajuanTTE,
  useUploadFilePengajuanTTE,
  useGetDokumenTTE,
  useUploadFileFromUrl,
} from "@/hooks/kominfo-submissions";
import { UploadOutlined } from "@ant-design/icons";
import { Alert, Badge, Group, Stack, Text } from "@mantine/core";
import {
  IconAlertCircle,
  IconCertificate,
  IconExternalLink,
  IconId,
  IconMail,
  IconNote,
  IconUser,
  IconFileCheck,
  IconClipboardList,
} from "@tabler/icons-react";
import {
  Card as AntdCard,
  message as antdMessage,
  Button,
  Divider,
  Form,
  Input,
  Result,
  Spin,
  Upload,
  Modal,
  Select,
  Radio,
  Space,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useRouter } from "next/router";
import { useState } from "react";

dayjs.locale("id");

function FormTTE({ pengajuanId }) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [fileKTP, setFileKTP] = useState([]);
  const [fileSKJabatan, setFileSKJabatan] = useState([]);
  const [fileSuratUsulan, setFileSuratUsulan] = useState([]);
  const [uploadingKTP, setUploadingKTP] = useState(false);
  const [uploadingSKJ, setUploadingSKJ] = useState(false);
  const [uploadingSuratUsulan, setUploadingSuratUsulan] = useState(false);

  const { data, isLoading, error, refetch } = usePengajuanTTEById(pengajuanId);
  const { data: dokumenData, isLoading: isLoadingDokumen } = useGetDokumenTTE();
  const uploadFile = useUploadFilePengajuanTTE();
  const uploadFromUrl = useUploadFileFromUrl();
  const submitPengajuan = useSubmitPengajuanTTE();

  // Modal state for selecting SK Jabatan
  const [showSKModal, setShowSKModal] = useState(false);
  const [uploadMode, setUploadMode] = useState("manual"); // 'manual' or 'riwayat'
  const [selectedJabatan, setSelectedJabatan] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  // Handle upload file KTP
  const handleUploadKTP = async () => {
    if (fileKTP.length === 0) {
      antdMessage.warning("Pilih file KTP terlebih dahulu");
      return;
    }

    try {
      setUploadingKTP(true);
      const formData = new FormData();
      formData.append("file", fileKTP[0].originFileObj);
      formData.append("type", "ktp");

      await uploadFile.mutateAsync({
        id: pengajuanId,
        formData,
      });

      antdMessage.success("File KTP berhasil diunggah!");
      await refetch();
      setFileKTP([]); // Clear file list after successful upload
    } catch (error) {
      console.error("Error uploading KTP:", error);
      antdMessage.error("Gagal mengunggah file KTP");
    } finally {
      setUploadingKTP(false);
    }
  };

  // Handle upload SK Jabatan dari riwayat (menggunakan backend)
  const handleUploadSKFromRiwayat = async () => {
    if (!selectedJabatan) {
      antdMessage.warning("Pilih SK Jabatan terlebih dahulu");
      return;
    }

    try {
      setIsDownloading(true);
      setUploadingSKJ(true);

      // Upload file from URL via backend
      await uploadFromUrl.mutateAsync({
        id: pengajuanId,
        data: {
          url: selectedJabatan.file,
          type: "skj",
        },
      });

      antdMessage.success("File SK Jabatan berhasil diunggah!");
      await refetch();
      setShowSKModal(false);
      setSelectedJabatan(null);
      setUploadMode("manual");
    } catch (error) {
      console.error("Error uploading SK Jabatan:", error);
      antdMessage.error(error.message || "Gagal mengunggah file SK Jabatan");
    } finally {
      setIsDownloading(false);
      setUploadingSKJ(false);
    }
  };

  // Handle upload file SK Jabatan (manual)
  const handleUploadSKJabatan = async () => {
    if (fileSKJabatan.length === 0) {
      antdMessage.warning("Pilih file SK Jabatan terlebih dahulu");
      return;
    }

    try {
      setUploadingSKJ(true);
      const formData = new FormData();
      formData.append("file", fileSKJabatan[0].originFileObj);
      formData.append("type", "skj");

      await uploadFile.mutateAsync({
        id: pengajuanId,
        formData,
      });

      antdMessage.success("File SK Jabatan berhasil diunggah!");
      await refetch();
      setFileSKJabatan([]); // Clear file list after successful upload
    } catch (error) {
      console.error("Error uploading SK Jabatan:", error);
      antdMessage.error("Gagal mengunggah file SK Jabatan");
    } finally {
      setUploadingSKJ(false);
    }
  };

  // Handle upload file Surat Usulan
  const handleUploadSuratUsulan = async () => {
    if (fileSuratUsulan.length === 0) {
      antdMessage.warning("Pilih file Surat Usulan terlebih dahulu");
      return;
    }

    try {
      setUploadingSuratUsulan(true);
      const formData = new FormData();
      formData.append("file", fileSuratUsulan[0].originFileObj);
      formData.append("type", "surat_usulan");

      await uploadFile.mutateAsync({
        id: pengajuanId,
        formData,
      });

      antdMessage.success("File Surat Usulan berhasil diunggah!");
      await refetch();
      setFileSuratUsulan([]); // Clear file list after successful upload
    } catch (error) {
      console.error("Error uploading Surat Usulan:", error);
      antdMessage.error("Gagal mengunggah file Surat Usulan");
    } finally {
      setUploadingSuratUsulan(false);
    }
  };

  // Handle submit pengajuan
  const handleSubmit = async () => {
    // Validate all files are uploaded
    if (!data?.file_ktp || !data?.file_sk_pangkat || !data?.file_surat_usulan) {
      antdMessage.warning(
        "Pastikan semua dokumen telah diunggah sebelum submit"
      );
      return;
    }

    try {
      await submitPengajuan.mutateAsync(pengajuanId);
      antdMessage.success("Pengajuan TTE berhasil diajukan!");
      await refetch();
      // Redirect to list after success
      setTimeout(() => {
        router.push("/kominfo-services/tte");
      }, 1500);
    } catch (error) {
      console.error("Error submitting pengajuan:", error);
      antdMessage.error("Gagal mengajukan pengajuan TTE");
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
                help={
                  <Text size="xs" c="dimmed">
                    Foto/scan KTP berwarna, jelas terbaca, dan tidak blur
                  </Text>
                }
              >
                <Group gap="sm" align="flex-start">
                  <div style={{ flex: 1 }}>
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
                        {fileKTP.length > 0
                          ? "Ganti File KTP"
                          : "Pilih File KTP"}
                      </Button>
                    </Upload>
                    {data?.file_ktp && (
                      <Group gap={4} mt={4}>
                        <Text size="xs" c="green">
                          ✓ File sudah diunggah
                        </Text>
                        <a
                          href={data.file_ktp}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "12px",
                            color: "#6366f1",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          <IconExternalLink size={12} />
                          Lihat
                        </a>
                      </Group>
                    )}
                  </div>
                  <Button
                    type="primary"
                    onClick={handleUploadKTP}
                    loading={uploadingKTP}
                    disabled={!isEditable || fileKTP.length === 0}
                    style={{
                      background: "#6366f1",
                      borderColor: "#6366f1",
                    }}
                  >
                    Unggah
                  </Button>
                </Group>
              </Form.Item>

              <Form.Item
                label="Upload SK Jabatan"
                help={
                  <Text size="xs" c="dimmed">
                    Scan SK jabatan terbaru yang masih berlaku, tulisan jelas
                    terbaca
                  </Text>
                }
              >
                <Group gap="sm" align="flex-start">
                  <div style={{ flex: 1 }}>
                    <Group gap="xs" mb="xs">
                      <Button
                        size="small"
                        icon={<IconClipboardList size={14} />}
                        onClick={() => setShowSKModal(true)}
                        disabled={!isEditable || isLoadingDokumen}
                      >
                        Pilih dari Riwayat
                      </Button>
                    </Group>
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
                          : "Pilih File Manual"}
                      </Button>
                    </Upload>
                    {data?.file_sk_pangkat && (
                      <Group gap={4} mt={4}>
                        <Text size="xs" c="green">
                          ✓ File sudah diunggah
                        </Text>
                        <a
                          href={data.file_sk_pangkat}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "12px",
                            color: "#6366f1",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          <IconExternalLink size={12} />
                          Lihat
                        </a>
                      </Group>
                    )}
                  </div>
                  <Button
                    type="primary"
                    onClick={handleUploadSKJabatan}
                    loading={uploadingSKJ}
                    disabled={!isEditable || fileSKJabatan.length === 0}
                    style={{
                      background: "#6366f1",
                      borderColor: "#6366f1",
                    }}
                  >
                    Unggah
                  </Button>
                </Group>
              </Form.Item>

              <Form.Item
                label="Upload Surat Usulan TTE"
                help={
                  <Text size="xs" c="dimmed">
                    Surat usulan bermaterai dari instansi, scan jelas dan dapat
                    dibaca
                  </Text>
                }
              >
                <Group gap="sm" align="flex-start">
                  <div style={{ flex: 1 }}>
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
                    {data?.file_surat_usulan && (
                      <Group gap={4} mt={4}>
                        <Text size="xs" c="green">
                          ✓ File sudah diunggah
                        </Text>
                        <a
                          href={data.file_surat_usulan}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "12px",
                            color: "#6366f1",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          <IconExternalLink size={12} />
                          Lihat
                        </a>
                      </Group>
                    )}
                  </div>
                  <Button
                    type="primary"
                    onClick={handleUploadSuratUsulan}
                    loading={uploadingSuratUsulan}
                    disabled={!isEditable || fileSuratUsulan.length === 0}
                    style={{
                      background: "#6366f1",
                      borderColor: "#6366f1",
                    }}
                  >
                    Unggah
                  </Button>
                </Group>
              </Form.Item>

              {/* Submit Button - Only show if status is DRAFT or PERBAIKAN */}
              {isEditable && (
                <>
                  <Divider />
                  <Alert
                    icon={<IconAlertCircle />}
                    color="blue"
                    variant="light"
                    mb="md"
                    styles={{
                      root: {
                        borderRadius: 8,
                      },
                    }}
                  >
                    <Text size="sm">
                      Pastikan semua dokumen sudah diunggah sebelum submit
                      pengajuan
                    </Text>
                  </Alert>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Group justify="flex-end" gap="sm">
                      <Button
                        onClick={() => router.push("/kominfo-services/tte")}
                      >
                        Batal
                      </Button>
                      <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={submitPengajuan.isPending}
                        disabled={
                          !data?.file_ktp ||
                          !data?.file_sk_pangkat ||
                          !data?.file_surat_usulan
                        }
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

      {/* Modal Pilih SK Jabatan dari Riwayat */}
      <Modal
        title={
          <Group gap="xs">
            <IconFileCheck size={20} color="#6366f1" />
            <span>Pilih SK Jabatan dari Riwayat</span>
          </Group>
        }
        open={showSKModal}
        onCancel={() => {
          setShowSKModal(false);
          setSelectedJabatan(null);
          setUploadMode("manual");
        }}
        width={700}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setShowSKModal(false);
              setSelectedJabatan(null);
              setUploadMode("manual");
            }}
          >
            Batal
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleUploadSKFromRiwayat}
            loading={isDownloading || uploadingSKJ}
            disabled={!selectedJabatan}
            style={{
              background: "#6366f1",
              borderColor: "#6366f1",
            }}
          >
            Gunakan SK Ini
          </Button>,
        ]}
      >
        <Divider style={{ margin: "12px 0" }} />
        {isLoadingDokumen ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin />
            <Text size="sm" c="dimmed" mt="md">
              Memuat riwayat jabatan...
            </Text>
          </div>
        ) : (
          <div>
            <Text size="sm" mb="md" c="dimmed">
              Pilih SK Jabatan dari riwayat Anda yang akan digunakan untuk
              pengajuan TTE
            </Text>
            <Radio.Group
              value={selectedJabatan?.id}
              onChange={(e) => {
                const selected = dokumenData?.jabatan?.find(
                  (jab) => jab.id === e.target.value
                );
                setSelectedJabatan(selected);
              }}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {dokumenData?.jabatan?.map((jab) => (
                  <Radio
                    key={jab.id}
                    value={jab.id}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      marginBottom: "8px",
                      backgroundColor:
                        selectedJabatan?.id === jab.id ? "#f0f0ff" : "white",
                    }}
                  >
                    <div>
                      <Group justify="space-between" align="flex-start">
                        <div style={{ flex: 1 }}>
                          <Text fw={600} size="sm">
                            {jab.jabatan}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {jab.jenis_jabatan} • SK: {jab.nomor_sk}
                          </Text>
                          <Text size="xs" c="dimmed">
                            TMT: {jab.tmt_jabatan} • Status:{" "}
                            <span
                              style={{
                                color:
                                  jab.aktif === "Y" ? "#10b981" : "#6b7280",
                                fontWeight: 500,
                              }}
                            >
                              {jab.aktif === "Y" ? "Aktif" : "Tidak Aktif"}
                            </span>
                          </Text>
                        </div>
                        {jab.file && (
                          <a
                            href={jab.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              fontSize: "12px",
                              color: "#6366f1",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              border: "1px solid #6366f1",
                              textDecoration: "none",
                              marginLeft: "8px",
                            }}
                          >
                            <IconExternalLink size={12} />
                            Lihat SK
                          </a>
                        )}
                      </Group>
                    </div>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>
        )}
      </Modal>
    </>
  );
}

export default FormTTE;

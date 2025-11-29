import {
  Accordion,
  Alert,
  Box,
  Center,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconCheck,
  IconFileText,
  IconFileUpload,
  IconInfoCircle,
  IconMail,
  IconPhone,
  IconUser,
  IconUserCheck,
} from "@tabler/icons-react";
import {
  Button,
  Checkbox,
  Descriptions,
  Form,
  Input,
  Modal,
  Result,
  Skeleton,
  Space,
  Steps,
  Upload,
} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import UserInfoCard, { UserInfoCompact } from "../UserInfoCard";

const jenisPermasalahanOptions = [
  { value: "kepegawaian", label: "Kepegawaian" },
  { value: "perdata", label: "Perdata" },
  { value: "administrasi_pemerintahan", label: "Administrasi Pemerintahan" },
  { value: "lainnya", label: "Lainnya" },
];

const FormKonsultasiHukum = ({ user, loading: userLoading, onSubmit, submitLoading }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [confirmModal, setConfirmModal] = useState(false);
  const [formValues, setFormValues] = useState(null);

  // Watch form values
  const jenisPermasalahan = Form.useWatch("jenisPermasalahan", form);

  const handleNext = async () => {
    if (current === 1) {
      try {
        const values = await form.validateFields();
        setFormValues(values);
        setConfirmModal(true);
      } catch (err) {}
    } else {
      setCurrent(current + 1);
    }
  };

  const handlePrev = () => setCurrent(current - 1);

  const handleConfirmSubmit = async () => {
    try {
      await onSubmit?.({ ...formValues, user });
      setConfirmModal(false);
      setCurrent(2);
    } catch (err) {
      setConfirmModal(false);
    }
  };

  const steps = [
    { title: "Verifikasi", icon: <IconUserCheck size={18} /> },
    { title: "Formulir", icon: <IconFileText size={18} /> },
    { title: "Selesai", icon: <IconCheck size={18} /> },
  ];

  const renderStep1 = () => {
    if (userLoading) {
      return (
        <Paper p="md" radius="md" withBorder>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Paper>
      );
    }

    return (
      <Stack gap="sm">
        <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
          Pastikan data Anda sudah benar sebelum melanjutkan.
        </Alert>
        <UserInfoCard user={user} />
      </Stack>
    );
  };

  const renderStep2 = () => (
    <Stack gap="sm">
      <Accordion variant="contained" radius="md">
        <Accordion.Item value="info">
          <Accordion.Control icon={<IconUser size={16} />}>
            <Text size="sm" fw={500}>Data Pribadi</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <UserInfoCompact user={user} />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Paper p="md" radius="md" withBorder>
        <Form form={form} layout="vertical" requiredMark="optional" size="small">
          {/* Kontak */}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <div>
              <Text size="xs" fw={500} mb={4}>No. HP/WA</Text>
              <Form.Item
                name="noHp"
                rules={[{ required: true, message: "Wajib diisi" }]}
                style={{ marginBottom: 0 }}
              >
                <Input size="small" placeholder="081234567890" prefix={<IconPhone size={14} />} />
              </Form.Item>
            </div>
            <div>
              <Text size="xs" fw={500} mb={4}>Email</Text>
              <Form.Item
                name="email"
                rules={[{ required: true }, { type: "email", message: "Format email salah" }]}
                style={{ marginBottom: 0 }}
              >
                <Input size="small" placeholder="nama@email.com" prefix={<IconMail size={14} />} />
              </Form.Item>
            </div>
          </SimpleGrid>

          <Divider my="md" label={<Text size="xs" fw={600} c="blue">Bagian B. Ringkasan Permasalahan</Text>} labelPosition="left" />

          {/* Jenis Permasalahan Hukum */}
          <div>
            <Text size="xs" fw={500} mb={8}>Jenis Permasalahan Hukum (opsional):</Text>
            <Form.Item name="jenisPermasalahan" style={{ marginBottom: 0 }}>
              <Checkbox.Group>
                <Group gap="md">
                  {jenisPermasalahanOptions.map((opt) => (
                    <Checkbox key={opt.value} value={opt.value}>
                      <Text size="xs">{opt.label}</Text>
                    </Checkbox>
                  ))}
                </Group>
              </Checkbox.Group>
            </Form.Item>
          </div>

          {/* Input Lainnya */}
          {jenisPermasalahan?.includes("lainnya") && (
            <div style={{ marginTop: 8 }}>
              <Form.Item
                name="jenisPermasalahanLainnya"
                rules={[{ required: true, message: "Isi jenis permasalahan lainnya" }]}
                style={{ marginBottom: 0 }}
              >
                <Input size="small" placeholder="Tuliskan jenis permasalahan lainnya..." />
              </Form.Item>
            </div>
          )}

          {/* Ringkasan Permasalahan */}
          <div style={{ marginTop: 16 }}>
            <Text size="xs" fw={500} mb={4}>Ringkasan Permasalahan Hukum (*)</Text>
            <Form.Item
              name="ringkasan"
              rules={[{ required: true, message: "Wajib diisi" }]}
              style={{ marginBottom: 0 }}
            >
              <Input.TextArea 
                size="small" 
                rows={5} 
                placeholder="Jelaskan ringkasan permasalahan hukum yang Anda hadapi..."
              />
            </Form.Item>
          </div>

          {/* Lampiran Dokumen */}
          <div style={{ marginTop: 16 }}>
            <Text size="xs" fw={500} mb={4}>Lampiran Dokumen (opsional, PDF/DOC ≤ 5MB):</Text>
            <Form.Item name="lampiran" style={{ marginBottom: 0 }}>
              <Upload.Dragger 
                maxCount={3} 
                beforeUpload={() => false} 
                accept=".pdf,.doc,.docx"
                style={{ padding: "12px 0" }}
              >
                <Group justify="center" gap={8}>
                  <IconFileUpload size={20} color="#999" />
                  <Stack gap={2} align="center">
                    <Text size="xs">Klik atau drag file ke sini</Text>
                    <Text size="xs" c="dimmed">Maks. 3 file, format PDF/DOC, ukuran ≤ 5MB</Text>
                  </Stack>
                </Group>
              </Upload.Dragger>
            </Form.Item>
          </div>

          <Divider my="md" label={<Text size="xs" fw={600} c="blue">Bagian C. Konfirmasi</Text>} labelPosition="left" />

          {/* Persetujuan */}
          <div>
            <Text size="xs" fw={500} mb={8}>Pernyataan (*)</Text>
            <Form.Item
              name="persetujuan"
              valuePropName="checked"
              rules={[{ validator: (_, val) => val ? Promise.resolve() : Promise.reject("Wajib disetujui") }]}
              style={{ marginBottom: 0 }}
            >
              <Checkbox>
                <Text size="xs">
                  Saya menyatakan data yang saya isi adalah benar, dan saya menyetujui 
                  bahwa jawaban konsultasi hukum akan disampaikan secara tertulis 
                  melalui email/WA sesuai ketentuan yang berlaku.
                </Text>
              </Checkbox>
            </Form.Item>
            <Text size="xs" c="dimmed" mt={8}>Keterangan: (*) wajib diisi</Text>
          </div>
        </Form>
      </Paper>
    </Stack>
  );

  const renderStep3 = () => (
    <Result
      status="success"
      title="Konsultasi Berhasil Diajukan!"
      subTitle="Jawaban akan disampaikan secara tertulis melalui email/WA."
      extra={[
        <Button type="primary" key="list" onClick={() => router.push("/sapa-asn/konsultasi-hukum")}>
          Lihat Daftar
        </Button>,
        <Button key="new" onClick={() => { form.resetFields(); setCurrent(0); }}>
          Ajukan Baru
        </Button>,
      ]}
    />
  );

  const getJenisLabel = (values) => {
    if (!values || values.length === 0) return "-";
    return values.map(v => {
      if (v === "lainnya") return formValues?.jenisPermasalahanLainnya || "Lainnya";
      return jenisPermasalahanOptions.find(k => k.value === v)?.label;
    }).join(", ");
  };

  return (
    <Center>
      <Box w={{ base: "100%", sm: 600, md: 700 }}>
        <Stack gap="md">
          <Paper p="sm" radius="md" withBorder>
            <Steps current={current} items={steps} size="small" />
          </Paper>

          {current === 0 && renderStep1()}
          {current === 1 && renderStep2()}
          {current === 2 && renderStep3()}

          {current < 2 && (
            <Paper p="sm" radius="md" withBorder>
              <Group justify="space-between">
                <Button danger size="small" onClick={() => router.push("/sapa-asn/konsultasi-hukum")}>
                  Batal
                </Button>
                <Space>
                  {current > 0 && <Button size="small" onClick={handlePrev}>Kembali</Button>}
                  <Button type="primary" size="small" onClick={handleNext} disabled={current === 0 && userLoading}>
                    {current === 1 ? "Submit" : "Lanjut"}
                  </Button>
                </Space>
              </Group>
            </Paper>
          )}

          <Modal
            title="Konfirmasi Pengajuan"
            open={confirmModal}
            onCancel={() => setConfirmModal(false)}
            onOk={handleConfirmSubmit}
            okText="Ya, Ajukan"
            cancelText="Periksa Kembali"
            confirmLoading={submitLoading}
            width={450}
          >
            <Stack gap="sm">
              <Text size="sm">Ajukan konsultasi hukum dengan data berikut?</Text>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Jenis Permasalahan">
                  {getJenisLabel(formValues?.jenisPermasalahan)}
                </Descriptions.Item>
                <Descriptions.Item label="Ringkasan">
                  {formValues?.ringkasan?.substring(0, 100)}...
                </Descriptions.Item>
              </Descriptions>
            </Stack>
          </Modal>
        </Stack>
      </Box>
    </Center>
  );
};

export default FormKonsultasiHukum;

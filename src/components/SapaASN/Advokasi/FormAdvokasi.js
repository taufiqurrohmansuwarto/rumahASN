import {
  Accordion,
  Alert,
  Badge,
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
  IconAlertCircle,
  IconCalendar,
  IconCheck,
  IconClock,
  IconFileText,
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
  Radio,
  Result,
  Select,
  Skeleton,
  Space,
  Steps,
  Tag,
} from "antd";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import UserInfoCard, { UserInfoCompact } from "../UserInfoCard";

const kategoriOptions = [
  { value: "kontrak_perjanjian", label: "Kontrak/perjanjian dengan pihak ketiga" },
  { value: "kepegawaian_disiplin", label: "Kepegawaian & disiplin ASN" },
  { value: "sengketa_aset", label: "Sengketa aset/keuangan" },
  { value: "regulasi_produk_hukum", label: "Regulasi/produk hukum daerah" },
  { value: "lainnya", label: "Lainnya" },
];

const FormAdvokasi = ({ 
  user, 
  loading: userLoading, 
  onSubmit, 
  submitLoading,
  jadwalData,
  jadwalLoading,
}) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [confirmModal, setConfirmModal] = useState(false);
  const [formValues, setFormValues] = useState(null);
  
  // Watch form values
  const kategori = Form.useWatch("kategori", form);
  const sensitif = Form.useWatch("sensitif", form);

  // Set default values from profile
  useEffect(() => {
    if (user?.noHp || user?.email) {
      form.setFieldsValue({
        noHp: user.noHp || "",
        email: user.email || "",
      });
    }
  }, [user, form]);

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

  const jadwal = jadwalData?.jadwal || [];
  const jadwalInfo = jadwalData?.info || {};
  const sudahDaftarDalam3Bulan = jadwalInfo?.sudah_daftar_dalam_3_bulan;
  const advokasiTerakhir = jadwalInfo?.advokasi_terakhir;
  const tanggalBolehAjukan = jadwalInfo?.tanggal_boleh_ajukan_formatted;
  const sisaHari = jadwalInfo?.sisa_hari;
  const ketentuan = jadwalInfo?.ketentuan;

  const renderStep1 = () => {
    if (userLoading || jadwalLoading) {
      return (
        <Paper p="md" radius="md" withBorder>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Paper>
      );
    }

    // If already registered within the last 3 months
    if (sudahDaftarDalam3Bulan) {
      return (
        <Stack gap="sm">
          <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light">
            Anda tidak dapat mengajukan permohonan advokasi karena sudah pernah mengajukan 
            dalam kurun waktu 3 bulan terakhir. Pengajuan ulang dapat dilakukan setelah 
            tanggal <b>{tanggalBolehAjukan}</b> ({sisaHari} hari lagi).
          </Alert>
          <Paper p="md" radius="md" withBorder>
            <Text size="sm" fw={500} mb="sm">Pengajuan Terakhir Anda:</Text>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Status">
                <Tag color="blue">{advokasiTerakhir?.status || "Pending"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tanggal Pendaftaran">
                {advokasiTerakhir?.created_at 
                  ? new Date(advokasiTerakhir.created_at).toLocaleDateString("id-ID", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric"
                    })
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Dapat Mengajukan Kembali">
                <Text size="sm" c="green" fw={500}>{tanggalBolehAjukan}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Paper>
        </Stack>
      );
    }

    return (
      <Stack gap="sm">
        <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
          Pastikan data Anda sudah benar sebelum melanjutkan.
        </Alert>
        <UserInfoCard user={user} />

        {/* Ketentuan Sesi Advokasi */}
        {ketentuan && (
          <Paper p="md" radius="md" withBorder bg="gray.0">
            <Group gap={8} mb="sm">
              <IconClock size={16} />
              <Text size="sm" fw={600}>Ketentuan Sesi Advokasi</Text>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
              <Group gap={4}>
                <Text size="xs" c="dimmed">Hari Sesi:</Text>
                <Text size="xs" fw={500}>{ketentuan.hari_sesi}</Text>
              </Group>
              <Group gap={4}>
                <Text size="xs" c="dimmed">Waktu:</Text>
                <Text size="xs" fw={500}>{ketentuan.waktu_sesi}</Text>
              </Group>
              <Group gap={4}>
                <Text size="xs" c="dimmed">Durasi:</Text>
                <Text size="xs" fw={500}>{ketentuan.durasi_per_sesi}</Text>
              </Group>
              <Group gap={4}>
                <Text size="xs" c="dimmed">Batas Daftar:</Text>
                <Text size="xs" fw={500} c="red">{ketentuan.batas_pendaftaran}</Text>
              </Group>
              <Group gap={4}>
                <Text size="xs" c="dimmed">Tipe:</Text>
                <Text size="xs" fw={500}>{ketentuan.tipe_sesi}</Text>
              </Group>
            </SimpleGrid>
          </Paper>
        )}
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

          <Divider my="md" label={<Text size="xs" fw={500}>Topik Konsultasi (Umum)</Text>} labelPosition="left" />

          {/* Kategori Isu Hukum */}
          <div>
            <Text size="xs" c="dimmed" mb={4}>Kategori isu hukum:</Text>
            <Form.Item
              name="kategori"
              rules={[{ required: true, message: "Pilih kategori isu hukum" }]}
              style={{ marginBottom: 0 }}
            >
              <Select
                size="small"
                placeholder="Pilih kategori isu hukum"
                options={kategoriOptions}
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </div>

          {/* Input Lainnya */}
          {kategori === "lainnya" && (
            <div style={{ marginTop: 8, marginLeft: 24 }}>
              <Form.Item
                name="kategoriLainnya"
                rules={[{ required: true, message: "Isi kategori lainnya" }]}
                style={{ marginBottom: 0 }}
              >
                <Input size="small" placeholder="Tuliskan kategori lainnya..." style={{ maxWidth: 300 }} />
              </Form.Item>
            </div>
          )}

          <Divider my="md" label={<Text size="xs" fw={500}>Sensitivitas Materi</Text>} labelPosition="left" />

          {/* Sensitivitas */}
          <div>
            <Text size="xs" c="dimmed" mb={8}>Apakah materi konsultasi bersifat sensitif/rahasia?</Text>
            <Form.Item
              name="sensitif"
              rules={[{ required: true, message: "Pilih salah satu" }]}
              style={{ marginBottom: 0 }}
            >
              <Radio.Group>
                <Stack gap={6}>
                  <Radio value="ya">
                    <Text size="xs">Ya → Detail hanya akan disampaikan saat konsultasi</Text>
                  </Radio>
                  <Radio value="tidak">
                    <Text size="xs">Tidak → Silakan tuliskan poin-poin singkat di bawah</Text>
                  </Radio>
                </Stack>
              </Radio.Group>
            </Form.Item>
          </div>

          {/* Poin Konsultasi - hanya muncul jika tidak sensitif */}
          {sensitif === "tidak" && (
            <>
              <Divider my="md" label={
                <Stack gap={0}>
                  <Text size="xs" fw={500}>(Opsional) Poin-Poin Konsultasi</Text>
                  <Text size="xs" c="dimmed" fs="italic">diisi hanya jika tidak bersifat sensitif</Text>
                </Stack>
              } labelPosition="left" />

              <Form.Item name="poinKonsultasi" style={{ marginBottom: 0 }}>
                <Input.TextArea 
                  size="small" 
                  rows={4} 
                  placeholder="Tuliskan poin-poin konsultasi yang ingin dibahas..."
                />
              </Form.Item>
            </>
          )}

          <Divider my="md" label={<Text size="xs" fw={500}>Jadwal Konsultasi</Text>} labelPosition="left" />

          {/* Jadwal */}
          <div>
            {jadwalLoading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : jadwal.length === 0 ? (
              <Alert icon={<IconInfoCircle size={14} />} color="gray" variant="light">
                <Text size="xs">Tidak ada jadwal tersedia saat ini. Silakan coba lagi nanti.</Text>
              </Alert>
            ) : (
              <Form.Item
                name="jadwal"
                rules={[{ required: true, message: "Pilih jadwal konsultasi" }]}
                style={{ marginBottom: 0 }}
              >
                <Radio.Group>
                  <Stack gap="md">
                    {jadwal.map((group) => (
                      <div key={group.bulan}>
                        <Group gap={4} mb={6}>
                          <IconCalendar size={14} />
                          <Text size="xs" fw={600}>{group.bulan}</Text>
                        </Group>
                        <Stack gap={4} ml={20}>
                          {group.slots.map((slot) => (
                            <Radio 
                              key={slot.value} 
                              value={slot.value}
                              disabled={slot.status === "full"}
                            >
                              <Group gap={8} wrap="wrap">
                                <Text size="xs">{slot.label}</Text>
                                <Badge 
                                  size="xs"
                                  color={slot.status === "full" ? "red" : slot.status === "limited" ? "orange" : "green"}
                                >
                                  {slot.status === "full" 
                                    ? "Penuh" 
                                    : `${slot.sisa_kuota}/${slot.kuota_maksimal} slot`}
                                </Badge>
                                <Text size="xs" c="dimmed">{slot.waktu}</Text>
                              </Group>
                              <Text size="xs" c="dimmed" fs="italic" ml={24}>
                                Batas daftar: {slot.deadline}
                              </Text>
                            </Radio>
                          ))}
                        </Stack>
                      </div>
                    ))}
                  </Stack>
                </Radio.Group>
              </Form.Item>
            )}
          </div>

          <Divider my="md" label={<Text size="xs" fw={500}>Persetujuan</Text>} labelPosition="left" />

          <Form.Item
            name="persetujuan"
            valuePropName="checked"
            rules={[{ validator: (_, val) => val ? Promise.resolve() : Promise.reject("Wajib disetujui") }]}
            style={{ marginBottom: 0 }}
          >
            <Checkbox>
              <Text size="xs">
                Saya menyatakan data yang diisi benar, dan memahami bahwa seluruh materi 
                konsultasi hukum bersifat rahasia serta hanya digunakan untuk kepentingan 
                pendampingan instansi.
              </Text>
            </Checkbox>
          </Form.Item>
        </Form>
      </Paper>
    </Stack>
  );

  const renderStep3 = () => (
    <Result
      status="success"
      title="Permohonan Berhasil!"
      subTitle="Tim kami akan segera menghubungi Anda sesuai jadwal yang dipilih."
      extra={[
        <Button type="primary" key="list" onClick={() => router.push("/sapa-asn/advokasi")}>
          Lihat Daftar
        </Button>,
        <Button key="new" onClick={() => { form.resetFields(); setCurrent(0); }}>
          Ajukan Baru
        </Button>,
      ]}
    />
  );

  const getKategoriLabel = (value) => {
    if (!value) return "-";
    if (value === "lainnya") return formValues?.kategoriLainnya || "Lainnya";
    return kategoriOptions.find(k => k.value === value)?.label || value;
  };

  const getJadwalLabel = (value) => {
    if (!value) return "-";
    for (const group of jadwal) {
      const slot = group.slots.find(s => s.value === value);
      if (slot) return `${slot.label} (${slot.waktu})`;
    }
    return value;
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
                <Button danger size="small" onClick={() => router.push("/sapa-asn/advokasi")}>
                  {sudahDaftarDalam3Bulan ? "Kembali" : "Batal"}
                </Button>
                {!sudahDaftarDalam3Bulan && (
                  <Space>
                    {current > 0 && <Button size="small" onClick={handlePrev}>Kembali</Button>}
                    <Button 
                      type="primary" 
                      size="small" 
                      onClick={handleNext} 
                      disabled={(current === 0 && (userLoading || jadwalLoading)) || jadwal.length === 0}
                    >
                      {current === 1 ? "Ajukan" : "Lanjut"}
                    </Button>
                  </Space>
                )}
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
              <Text size="sm">Ajukan permohonan advokasi dengan data berikut?</Text>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Kategori">
                  {getKategoriLabel(formValues?.kategori)}
                </Descriptions.Item>
                <Descriptions.Item label="Sensitif">
                  {formValues?.sensitif === "ya" ? "Ya" : "Tidak"}
                </Descriptions.Item>
                <Descriptions.Item label="Jadwal">
                  {getJadwalLabel(formValues?.jadwal)}
                </Descriptions.Item>
              </Descriptions>
            </Stack>
          </Modal>
        </Stack>
      </Box>
    </Center>
  );
};

export default FormAdvokasi;

import {
  useCreateEmailSubmission,
  useCheckEmailJatimprov,
  useEmailSubmissions,
  useGetPhone,
} from "@/hooks/kominfo-submissions";
import {
  IconMail,
  IconCircleCheck,
  IconPlus,
  IconClock,
  IconAlertCircle,
  IconPhone,
  IconUser,
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import {
  Card as AntdCard,
  Button,
  Form,
  Input,
  Modal,
  message,
  Radio,
  Space as AntSpace,
  Divider,
} from "antd";
import {
  Card,
  Text,
  Group,
  Stack,
  Alert,
  Title,
  Badge,
  Loader,
} from "@mantine/core";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

function EmailSubmission() {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [emailDetailOpen, setEmailDetailOpen] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [phoneOption, setPhoneOption] = useState("master"); // 'master', 'siasn', 'custom'
  const [form] = Form.useForm();
  const { data: session } = useSession();

  const {
    mutateAsync: createEmailSubmission,
    isPending: isCreatingEmailSubmission,
  } = useCreateEmailSubmission();

  const { data: emailData, isLoading: emailLoading } = useCheckEmailJatimprov();
  const { data: submissionsData, isLoading: submissionsLoading } =
    useEmailSubmissions();
  const { data: phoneData, isLoading: phoneLoading } = useGetPhone();

  const hasEmail = emailData?.success && emailData?.data;
  const pendingSubmission = submissionsData || null;

  useEffect(() => {
    if (session?.user?.employee_number) {
      form.setFieldsValue({
        nip: session?.user?.employee_number,
      });
    }
  }, [session?.user?.employee_number, form]);

  // Handle phone number selection
  useEffect(() => {
    if (phoneOption === "master" && phoneData?.no_hp_master) {
      form.setFieldsValue({
        no_hp: phoneData.no_hp_master,
      });
    } else if (phoneOption === "siasn" && phoneData?.no_hp_siasn) {
      form.setFieldsValue({
        no_hp: phoneData.no_hp_siasn,
      });
    } else if (phoneOption === "custom") {
      form.setFieldsValue({
        no_hp: "",
      });
    }
  }, [phoneOption, phoneData, form]);

  const handleOpenModal = () => {
    setModalOpen(true);
    // Set ulang NIP saat modal dibuka
    if (session?.user?.employee_number) {
      form.setFieldsValue({
        nip: session?.user?.employee_number,
      });
    }
    // Set default phone berdasarkan data yang tersedia
    if (phoneData?.no_hp_master) {
      setPhoneOption("master");
      form.setFieldsValue({
        no_hp: phoneData.no_hp_master,
      });
    } else if (phoneData?.no_hp_siasn) {
      setPhoneOption("siasn");
      form.setFieldsValue({
        no_hp: phoneData.no_hp_siasn,
      });
    } else {
      setPhoneOption("custom");
    }
  };

  const handleSubmit = async (values) => {
    Modal.confirm({
      title: "Konfirmasi Pengajuan Email",
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            <strong>Pastikan nomor HP Anda sudah benar!</strong>
          </p>
          <p style={{ marginBottom: 4 }}>NIP: {values.nip}</p>
          <p style={{ marginBottom: 4 }}>
            Nomor HP: <strong>{values.no_hp}</strong>
          </p>
          <p style={{ marginTop: 12, color: "#ff6b35" }}>
            Nomor HP akan digunakan untuk keperluan verifikasi dan komunikasi
            terkait email jatimprov Anda.
          </p>
        </div>
      ),
      okText: "Ya, Ajukan",
      cancelText: "Periksa Kembali",
      okButtonProps: {
        style: {
          background: "#ff6b35",
          borderColor: "#ff6b35",
        },
      },
      onOk: async () => {
        try {
          await createEmailSubmission(values);
          message.success("Pengajuan email berhasil dibuat!");
          setModalOpen(false);
          form.resetFields();
        } catch (error) {
          const errorMessage =
            error?.response?.data?.message ||
            "Terjadi kesalahan saat membuat permintaan email jatimprov";
          message.error(errorMessage);
        }
      },
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DIAJUKAN: { color: "yellow", label: "Menunggu Verifikasi" },
      DIPROSES: { color: "blue", label: "Sedang Diproses" },
      SELESAI: { color: "green", label: "Selesai" },
      DITOLAK: { color: "red", label: "Ditolak" },
    };

    const config = statusConfig[status] || {
      color: "gray",
      label: status || "Tidak Diketahui",
    };
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  if (emailLoading || submissionsLoading) {
    return (
      <AntdCard>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Loader size="lg" />
          <Text size="sm" c="dimmed" mt="md">
            Memuat data...
          </Text>
        </div>
      </AntdCard>
    );
  }

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
            background: "#ff6b35",
            color: "white",
            padding: 20,
            borderRadius: "12px 12px 0 0",
            margin: "-24px -24px 0 -24px",
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap">
            <div style={{ textAlign: "left" }}>
              <Group gap={8} mb={4}>
                <IconMail size={20} />
                <Title
                  order={3}
                  style={{ color: "white", margin: 0, fontSize: 18 }}
                >
                  Email Jatimprov
                </Title>
              </Group>
              <Text size="sm" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                Kelola email @jatimprov.go.id Anda
              </Text>
            </div>
            {!hasEmail && !pendingSubmission && (
              <Button
                type="default"
                icon={<IconPlus size={16} />}
                onClick={handleOpenModal}
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.95)",
                  color: "#ff6b35",
                  fontWeight: 600,
                  borderRadius: 6,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
                size="large"
              >
                Ajukan Email
              </Button>
            )}
          </Group>
        </div>

        <Stack gap="md" mt="md">
          {/* Status Email Aktif - Compact with Toggle */}
          {hasEmail && (
            <Alert
              icon={<IconCircleCheck size={16} />}
              color="green"
              variant="light"
              styles={{
                root: {
                  borderRadius: 8,
                  cursor: "pointer",
                  padding: "12px 16px",
                },
              }}
              onClick={() => setEmailDetailOpen(!emailDetailOpen)}
            >
              <Group justify="space-between" align="center" wrap="nowrap">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Group gap={6} mb={4} wrap="nowrap">
                    <Text size="sm" fw={600}>
                      Email Aktif
                    </Text>
                    <Badge color="green" size="sm" variant="light">
                      Verified
                    </Badge>
                  </Group>
                  <Group gap={6} align="center" wrap="nowrap">
                    <Text
                      size="xs"
                      fw={500}
                      c="green.7"
                      style={{
                        fontFamily: "monospace",
                        letterSpacing: showEmail ? "normal" : "2px",
                      }}
                    >
                      {showEmail
                        ? emailData.data.email_jatimprov
                        : "•••••••••@jatimprov.go.id"}
                    </Text>
                    <Button
                      type="text"
                      size="small"
                      icon={
                        showEmail ? (
                          <IconEyeOff size={14} />
                        ) : (
                          <IconEye size={14} />
                        )
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEmail(!showEmail);
                      }}
                      style={{ padding: "0 4px", height: "auto" }}
                    />
                  </Group>
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={
                    emailDetailOpen ? (
                      <IconChevronUp size={14} />
                    ) : (
                      <IconChevronDown size={14} />
                    )
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setEmailDetailOpen(!emailDetailOpen);
                  }}
                  style={{ padding: "0 6px" }}
                >
                  {emailDetailOpen ? "Tutup" : "Detail"}
                </Button>
              </Group>

              {emailDetailOpen && (
                <Stack
                  gap={6}
                  mt="sm"
                  pt="sm"
                  style={{ borderTop: "1px solid #d9f7be" }}
                >
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      NIP:
                    </Text>
                    <Text size="xs" fw={500}>
                      {emailData.data.nip}
                    </Text>
                  </Group>
                  {emailData.data.no_hp && (
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        No. HP:
                      </Text>
                      <Text size="xs" fw={500}>
                        {emailData.data.no_hp}
                      </Text>
                    </Group>
                  )}
                  {emailData.data.created_at && (
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        Dibuat:
                      </Text>
                      <Text size="xs">
                        {dayjs(emailData.data.created_at).format("DD MMM YYYY")}
                      </Text>
                    </Group>
                  )}
                </Stack>
              )}
            </Alert>
          )}

          {/* Status Pengajuan Pending - Compact */}
          {!hasEmail && pendingSubmission && (
            <Alert
              icon={<IconClock size={18} />}
              color="orange"
              variant="light"
              styles={{
                root: {
                  borderRadius: 8,
                  cursor: "pointer",
                },
              }}
              onClick={() => setDetailOpen(!detailOpen)}
            >
              <Group justify="space-between" align="center">
                <div style={{ flex: 1 }}>
                  <Group gap="xs" mb={4}>
                    <Text size="sm" fw={600}>
                      Pengajuan Email
                    </Text>
                    {getStatusBadge(pendingSubmission.status)}
                  </Group>
                  <Text size="xs" c="dimmed">
                    Diajukan{" "}
                    {dayjs(pendingSubmission.tanggal_ajuan).format(
                      "DD MMM YYYY"
                    )}
                  </Text>
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={
                    detailOpen ? (
                      <IconChevronUp size={16} />
                    ) : (
                      <IconChevronDown size={16} />
                    )
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetailOpen(!detailOpen);
                  }}
                >
                  {detailOpen ? "Tutup" : "Detail"}
                </Button>
              </Group>

              {detailOpen && (
                <Stack
                  gap="xs"
                  mt="md"
                  pt="md"
                  style={{ borderTop: "1px solid #ffe4d9" }}
                >
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      NIP:
                    </Text>
                    <Text size="sm">{pendingSubmission.nip}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      No. HP:
                    </Text>
                    <Text size="sm">{pendingSubmission.no_hp}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      Tanggal Ajuan:
                    </Text>
                    <Text size="sm" c="dimmed">
                      {dayjs(pendingSubmission.tanggal_ajuan).format(
                        "DD MMMM YYYY HH:mm"
                      )}
                    </Text>
                  </Group>
                  {pendingSubmission.catatan && (
                    <>
                      <Text size="sm" fw={500} mt="xs">
                        Catatan:
                      </Text>
                      <Text size="sm" c="dimmed">
                        {pendingSubmission.catatan}
                      </Text>
                    </>
                  )}
                </Stack>
              )}
            </Alert>
          )}

          {/* Belum Ada Email & Belum Pengajuan */}
          {!hasEmail && !pendingSubmission && (
            <Alert
              icon={<IconAlertCircle size={18} />}
              title="Belum Memiliki Email Jatimprov"
              color="orange"
              variant="light"
              styles={{
                root: {
                  borderRadius: 8,
                },
              }}
            >
              <Text size="sm" mb="md">
                Anda belum memiliki email @jatimprov.go.id. Silakan ajukan email
                dengan mengklik tombol &quot;Ajukan Email&quot; di atas.
              </Text>
              <Button
                type="primary"
                icon={<IconPlus size={16} />}
                onClick={handleOpenModal}
                style={{
                  background: "#ff6b35",
                  borderColor: "#ff6b35",
                }}
              >
                Ajukan Email Sekarang
              </Button>
            </Alert>
          )}

          {/* Info Cards */}
          <Group grow gap="xs">
            <Card padding="md" radius="md" withBorder>
              <Group gap="xs" justify="space-between">
                <Text size="xs" c="dimmed">
                  Status Akun
                </Text>
                <Group gap={6}>
                  {hasEmail ? (
                    <>
                      <IconCircleCheck size={16} color="#52c41a" />
                      <Text size="sm" fw={600} c="green">
                        Aktif
                      </Text>
                    </>
                  ) : (
                    <>
                      <IconClock size={16} color="#ff6b35" />
                      <Text size="sm" fw={600} style={{ color: "#ff6b35" }}>
                        {pendingSubmission ? "Pending" : "Belum Ada"}
                      </Text>
                    </>
                  )}
                </Group>
              </Group>
            </Card>

            <Card padding="md" radius="md" withBorder>
              <Group gap="xs" justify="space-between">
                <Text size="xs" c="dimmed">
                  Status Pengajuan
                </Text>
                <Group gap={6}>
                  <IconMail size={16} color="#ff6b35" />
                  <Text size="sm" fw={600}>
                    {pendingSubmission ? "Ada" : "Belum Ada"}
                  </Text>
                </Group>
              </Group>
            </Card>
          </Group>
        </Stack>
      </AntdCard>

      {/* Modal Form Pengajuan */}
      <Modal
        title={
          <Group gap="sm">
            <IconMail />
            <Text fw={600}>Ajukan Email Jatimprov</Text>
          </Group>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            nip: session?.user?.employee_number || "",
          }}
        >
          <Alert
            icon={<IconAlertCircle />}
            color="orange"
            variant="light"
            mb="md"
          >
            <Text>
              <strong>Pastikan nomor HP Anda sudah benar!</strong> Nomor HP akan
              digunakan untuk keperluan verifikasi dan komunikasi.
            </Text>
          </Alert>

          <Form.Item
            name="nip"
            label="NIP (Nomor Induk Pegawai)"
            rules={[
              { required: true, message: "NIP wajib diisi!" },
              { len: 18, message: "NIP harus 18 digit!" },
            ]}
          >
            <Input
              prefix={<IconUser />}
              placeholder="NIP akan terisi otomatis"
              maxLength={18}
              disabled
              style={{ backgroundColor: "#f5f5f5" }}
            />
          </Form.Item>

          {/* Phone Number Source Selection */}
          {!phoneLoading && phoneData && (
            <>
              <Text fw={500} mb="md">
                Pilih Sumber Nomor HP
              </Text>

              {(phoneData?.no_hp_master || phoneData?.no_hp_siasn) && (
                <Alert
                  icon={<IconCircleCheck />}
                  color="blue"
                  variant="light"
                  mb="md"
                >
                  <Text>
                    Data terintegrasi dengan{" "}
                    {phoneData?.no_hp_master && <strong>SIMASTER</strong>}
                    {phoneData?.no_hp_master &&
                      phoneData?.no_hp_siasn &&
                      " dan "}
                    {phoneData?.no_hp_siasn && <strong>SIASN</strong>}
                  </Text>
                </Alert>
              )}

              <Stack gap="sm" mb="md">
                {phoneData?.no_hp_master && (
                  <div
                    onClick={() => setPhoneOption("master")}
                    style={{
                      cursor: "pointer",
                      padding: "12px 16px",
                      border: `1px solid ${
                        phoneOption === "master" ? "#1890ff" : "#e8e8e8"
                      }`,
                      borderRadius: 8,
                      backgroundColor:
                        phoneOption === "master" ? "#f0f8ff" : "white",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm" wrap="nowrap">
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border:
                              phoneOption === "master"
                                ? "4px solid #1890ff"
                                : "2px solid #d9d9d9",
                          }}
                        />
                        <div>
                          <Text fw={600}>SIMASTER</Text>
                          <Text
                            size="sm"
                            c="dimmed"
                            style={{ fontFamily: "monospace" }}
                          >
                            {phoneData.no_hp_master}
                          </Text>
                        </div>
                      </Group>
                      {phoneOption === "master" && (
                        <IconCircleCheck color="#1890ff" />
                      )}
                    </Group>
                  </div>
                )}

                {phoneData?.no_hp_siasn && (
                  <div
                    onClick={() => setPhoneOption("siasn")}
                    style={{
                      cursor: "pointer",
                      padding: "12px 16px",
                      border: `1px solid ${
                        phoneOption === "siasn" ? "#52c41a" : "#e8e8e8"
                      }`,
                      borderRadius: 8,
                      backgroundColor:
                        phoneOption === "siasn" ? "#f6ffed" : "white",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm" wrap="nowrap">
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            border:
                              phoneOption === "siasn"
                                ? "4px solid #52c41a"
                                : "2px solid #d9d9d9",
                          }}
                        />
                        <div>
                          <Text fw={600}>SIASN</Text>
                          <Text
                            size="sm"
                            c="dimmed"
                            style={{ fontFamily: "monospace" }}
                          >
                            {phoneData.no_hp_siasn}
                          </Text>
                        </div>
                      </Group>
                      {phoneOption === "siasn" && (
                        <IconCircleCheck color="#52c41a" />
                      )}
                    </Group>
                  </div>
                )}

                <div
                  onClick={() => setPhoneOption("custom")}
                  style={{
                    cursor: "pointer",
                    padding: "12px 16px",
                    border: `1px solid ${
                      phoneOption === "custom" ? "#ff6b35" : "#e8e8e8"
                    }`,
                    borderRadius: 8,
                    backgroundColor:
                      phoneOption === "custom" ? "#fff7f0" : "white",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap">
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border:
                            phoneOption === "custom"
                              ? "4px solid #ff6b35"
                              : "2px solid #d9d9d9",
                        }}
                      />
                      <Text fw={600}>Input Nomor HP Sendiri</Text>
                    </Group>
                    {phoneOption === "custom" && (
                      <IconCircleCheck color="#ff6b35" />
                    )}
                  </Group>
                </div>
              </Stack>
            </>
          )}

          <Form.Item
            name="no_hp"
            label="Nomor HP"
            rules={[
              { required: true, message: "Nomor HP wajib diisi!" },
              {
                pattern: /^(\+62|62|0)[0-9]{9,12}$/,
                message: "Format nomor HP tidak valid!",
              },
            ]}
          >
            <Input
              prefix={<IconPhone />}
              placeholder="Contoh: 081234567890"
              maxLength={15}
              disabled={phoneOption !== "custom"}
              style={{
                backgroundColor: phoneOption !== "custom" ? "#f5f5f5" : "white",
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Group justify="flex-end" gap="sm">
              <Button onClick={() => setModalOpen(false)}>Batal</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreatingEmailSubmission}
                style={{
                  background: "#ff6b35",
                  borderColor: "#ff6b35",
                }}
              >
                Ajukan Sekarang
              </Button>
            </Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default EmailSubmission;

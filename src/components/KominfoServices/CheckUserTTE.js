import {
  useCheckTTE,
  useCreatePengajuanTTE,
} from "@/hooks/kominfo-submissions";
import {
  IconCertificate,
  IconCircleCheck,
  IconPlus,
  IconAlertCircle,
  IconChevronDown,
  IconChevronUp,
  IconMail,
  IconShieldCheck,
  IconRefresh,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { Card as AntdCard, Button, Modal, message } from "antd";
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
import { useRouter } from "next/router";
import { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import DaftarPengajuanTTEUser from "./DaftarPengajuanTTEUser";

dayjs.locale("id");

function CheckUserTTE() {
  const router = useRouter();
  const [bsreDetailOpen, setBsreDetailOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const { data: tteData, isLoading: tteLoading, refetch } = useCheckTTE();
  const { mutateAsync: createPengajuan, isPending: isCreatingPengajuan } =
    useCreatePengajuanTTE();

  const hasBSRE = tteData?.bsre;
  const hasMailJatim = tteData?.mail_jatim;
  const bsreInfo = tteData?.bsre_info;
  const mailJatimInfo = tteData?.mail_jatim_info; // Now a string

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCreateTTE = async () => {
    try {
      const result = await createPengajuan({});
      message.success("Pengajuan TTE berhasil dibuat!");
      setModalOpen(false);

      // Redirect ke halaman detail pengajuan TTE
      if (result?.id) {
        router.push(`/kominfo-services/tte/${result.id}`);
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "Terjadi kesalahan saat membuat pengajuan TTE";
      message.error(errorMessage);
    }
  };

  const handleGoToEmail = () => {
    router.push("/kominfo-services/email");
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      message.success("Data berhasil diperbarui");
    } catch (error) {
      message.error("Gagal memperbarui data");
    }
  };

  const maskEmail = (email) => {
    if (!email) return "";
    const [localPart, domain] = email.split("@");
    if (!domain) return "•••••••";
    const maskedLocal = "•".repeat(Math.min(localPart.length, 10));
    return `${maskedLocal}@${domain}`;
  };

  if (tteLoading) {
    return (
      <AntdCard>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Loader size="lg" />
          <Text size="sm" c="dimmed" mt="md">
            Memuat data TTE...
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
            background: "#6366f1",
            color: "white",
            padding: 20,
            borderRadius: "12px 12px 0 0",
            margin: "-24px -24px 0 -24px",
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap">
            <div style={{ textAlign: "left" }}>
              <Group gap={8} mb={4}>
                <IconCertificate size={20} />
                <Title
                  order={3}
                  style={{ color: "white", margin: 0, fontSize: 18 }}
                >
                  Tanda Tangan Elektronik (TTE)
                </Title>
              </Group>
              <Text size="sm" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                Kelola sertifikat digital Anda via BSRE
              </Text>
            </div>
            <Group gap="sm">
              {/* Tombol Refresh */}
              <Button
                type="default"
                icon={<IconRefresh size={16} />}
                onClick={handleRefresh}
                loading={tteLoading}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "white",
                  borderRadius: 6,
                }}
                size="large"
              >
                Refresh
              </Button>
              {/* Tombol hanya muncul jika bsre false dan mail_jatim true */}
              {!hasBSRE && hasMailJatim && (
                <Button
                  type="default"
                  icon={<IconPlus size={16} />}
                  onClick={handleOpenModal}
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    borderColor: "rgba(255, 255, 255, 0.95)",
                    color: "#6366f1",
                    fontWeight: 600,
                    borderRadius: 6,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                  size="large"
                >
                  Ajukan TTE
                </Button>
              )}
            </Group>
          </Group>
        </div>

        <Stack gap="md" mt="md">
          {/* Status TTE Aktif (BSRE = true) */}
          {hasBSRE && bsreInfo && (
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
              onClick={() => setBsreDetailOpen(!bsreDetailOpen)}
            >
              <Group justify="space-between" align="center" wrap="nowrap">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Group gap={6} mb={4} wrap="nowrap">
                    <Text size="sm" fw={600}>
                      Sertifikat TTE Aktif
                    </Text>
                    <Badge color="green" size="sm" variant="light">
                      {bsreInfo.status}
                    </Badge>
                  </Group>
                  <Text size="xs" c="green.7">
                    {bsreInfo.message}
                  </Text>
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={
                    bsreDetailOpen ? (
                      <IconChevronUp size={14} />
                    ) : (
                      <IconChevronDown size={14} />
                    )
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    setBsreDetailOpen(!bsreDetailOpen);
                  }}
                  style={{ padding: "0 6px" }}
                >
                  {bsreDetailOpen ? "Tutup" : "Detail"}
                </Button>
              </Group>

              {bsreDetailOpen && (
                <Stack
                  gap={6}
                  mt="sm"
                  pt="sm"
                  style={{ borderTop: "1px solid #d9f7be" }}
                >
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Status Code:
                    </Text>
                    <Text size="xs" fw={500}>
                      {bsreInfo.status_code}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      Status:
                    </Text>
                    <Badge color="green" size="xs">
                      {bsreInfo.status}
                    </Badge>
                  </Group>
                </Stack>
              )}
            </Alert>
          )}

          {/* Status Email Jatimprov (jika ada) */}
          {hasMailJatim && mailJatimInfo && (
            <Alert
              icon={<IconMail size={16} />}
              color="indigo"
              variant="light"
              styles={{
                root: {
                  borderRadius: 8,
                  padding: "12px 16px",
                },
              }}
            >
              <Group gap={6} mb={4} wrap="nowrap">
                <Text size="sm" fw={600}>
                  Email Jatimprov Terdaftar
                </Text>
                <Badge color="indigo" size="sm" variant="light">
                  Verified
                </Badge>
              </Group>
              <Group gap={6} align="center" wrap="nowrap">
                <Text
                  size="xs"
                  c="indigo.7"
                  style={{
                    fontFamily: "monospace",
                    flex: 1,
                    minWidth: 0,
                    letterSpacing: showEmail ? "normal" : "1px",
                  }}
                >
                  {showEmail ? mailJatimInfo : maskEmail(mailJatimInfo)}
                </Text>
                <Button
                  type="text"
                  size="small"
                  icon={
                    showEmail ? <IconEyeOff size={14} /> : <IconEye size={14} />
                  }
                  onClick={() => setShowEmail(!showEmail)}
                  style={{ padding: "0 4px", height: "auto" }}
                />
              </Group>
            </Alert>
          )}

          {/* Kondisi: Belum punya TTE tapi sudah punya email (bsre: false, mail_jatim: true) */}
          {!hasBSRE && hasMailJatim && (
            <Alert
              icon={<IconAlertCircle size={18} />}
              title="Belum Memiliki Sertifikat TTE"
              color="orange"
              variant="light"
              styles={{
                root: {
                  borderRadius: 8,
                },
              }}
            >
              <Text size="sm">
                Anda sudah memiliki email jatimprov namun belum memiliki
                sertifikat Tanda Tangan Elektronik (TTE). Silakan ajukan TTE
                dengan mengklik tombol &quot;Ajukan TTE&quot; di atas.
              </Text>
            </Alert>
          )}

          {/* Kondisi: Belum punya TTE dan belum punya email (bsre: false, mail_jatim: false) */}
          {!hasBSRE && !hasMailJatim && (
            <Alert
              icon={<IconAlertCircle size={18} />}
              title="Email Jatimprov Diperlukan"
              color="red"
              variant="light"
              styles={{
                root: {
                  borderRadius: 8,
                },
              }}
            >
              <Text size="sm" mb="md">
                Untuk mengajukan Tanda Tangan Elektronik (TTE), Anda harus
                memiliki email @jatimprov.go.id terlebih dahulu. Silakan ajukan
                email jatimprov Anda terlebih dahulu.
              </Text>
              <Button
                type="primary"
                icon={<IconMail size={16} />}
                onClick={handleGoToEmail}
                style={{
                  background: "#ff4d4f",
                  borderColor: "#ff4d4f",
                }}
              >
                Ajukan Email Jatimprov
              </Button>
            </Alert>
          )}

          {/* Info Cards */}
          <Group grow gap="xs">
            <Card padding="md" radius="md" withBorder>
              <Group gap="xs" justify="space-between">
                <Text size="xs" c="dimmed">
                  Status TTE
                </Text>
                <Group gap={6}>
                  {hasBSRE ? (
                    <>
                      <IconShieldCheck size={16} color="#52c41a" />
                      <Text size="sm" fw={600} c="green">
                        Aktif
                      </Text>
                    </>
                  ) : (
                    <>
                      <IconAlertCircle size={16} color="#ff4d4f" />
                      <Text size="sm" fw={600} c="red">
                        Belum Ada
                      </Text>
                    </>
                  )}
                </Group>
              </Group>
            </Card>

            <Card padding="md" radius="md" withBorder>
              <Group gap="xs" justify="space-between">
                <Text size="xs" c="dimmed">
                  Email Jatimprov
                </Text>
                <Group gap={6}>
                  {hasMailJatim ? (
                    <>
                      <IconCircleCheck size={16} color="#52c41a" />
                      <Text size="sm" fw={600} c="green">
                        Ada
                      </Text>
                    </>
                  ) : (
                    <>
                      <IconAlertCircle size={16} color="#ff4d4f" />
                      <Text size="sm" fw={600} c="red">
                        Belum Ada
                      </Text>
                    </>
                  )}
                </Group>
              </Group>
            </Card>
          </Group>
        </Stack>
      </AntdCard>

      {/* Modal Konfirmasi Pengajuan TTE */}
      <Modal
        title={
          <Group gap="sm">
            <IconCertificate />
            <Text fw={600}>Ajukan Tanda Tangan Elektronik</Text>
          </Group>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleCreateTTE}
        okText="Ya, Ajukan TTE"
        cancelText="Batal"
        confirmLoading={isCreatingPengajuan}
        okButtonProps={{
          style: {
            background: "#6366f1",
            borderColor: "#6366f1",
          },
        }}
        centered
        width={500}
      >
        <Stack gap="md" py="md">
          <Alert icon={<IconAlertCircle />} color="indigo" variant="light">
            <Text size="sm">
              Anda akan mengajukan pembuatan Sertifikat Tanda Tangan Elektronik
              (TTE) melalui BSRE. Pastikan data Anda sudah benar.
            </Text>
          </Alert>

          {hasMailJatim && mailJatimInfo && (
            <Card padding="md" radius="md" withBorder>
              <Stack gap="xs">
                <Text size="sm" fw={600}>
                  Email Terdaftar:
                </Text>
                <Group gap={6} align="center" wrap="nowrap">
                  <Text
                    size="sm"
                    c="dimmed"
                    style={{
                      fontFamily: "monospace",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {showEmail ? mailJatimInfo : maskEmail(mailJatimInfo)}
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
                    onClick={() => setShowEmail(!showEmail)}
                    style={{ padding: "0 4px", height: "auto" }}
                  />
                </Group>
              </Stack>
            </Card>
          )}

          <Text size="xs" c="dimmed">
            * Proses pembuatan sertifikat TTE akan memerlukan waktu beberapa
            saat. Anda akan mendapatkan notifikasi setelah proses selesai.
          </Text>
        </Stack>
      </Modal>
    </>
  );
}

export default CheckUserTTE;

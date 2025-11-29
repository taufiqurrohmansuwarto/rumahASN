import PageContainer from "@/components/PageContainer";
import SapaASNLayout from "@/components/SapaASN/SapaASNLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  getAdminKonsultasiHukumThreads,
  sendAdminKonsultasiHukumMessage,
} from "@/services/sapa-asn.services";
import {
  Accordion,
  Avatar,
  Badge,
  Box,
  Divider,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconCategory,
  IconFileText,
  IconHash,
  IconInfoCircle,
  IconMail,
  IconPhone,
  IconSend,
  IconUser,
  IconUserShield,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb, Button, FloatButton, Input, message, Modal, Skeleton, Tag } from "antd";
import dayjs from "dayjs";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

// Message bubble component - User on left, Admin on right
const MessageBubble = ({ msg, userImage, userName, isAdmin }) => {
  const time = dayjs(msg.created_at).format("DD MMM, HH:mm");

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: isAdmin ? "row-reverse" : "row",
        gap: 10,
        marginBottom: 16,
      }}
    >
      <Avatar
        src={isAdmin ? null : userImage}
        size="sm"
        radius="xl"
        color={isAdmin ? "blue" : "gray"}
        style={{ flexShrink: 0 }}
      >
        {isAdmin ? <IconUserShield size={14} /> : <IconUser size={14} />}
      </Avatar>
      <Box style={{ maxWidth: "70%" }}>
        <Text size="xs" c="dimmed" mb={4} ta={isAdmin ? "right" : "left"}>
          {isAdmin ? "Anda (Admin)" : userName}
        </Text>
        <Paper
          p="sm"
          radius="lg"
          bg={isAdmin ? "blue.6" : "gray.1"}
          style={{
            borderTopLeftRadius: isAdmin ? 16 : 4,
            borderTopRightRadius: isAdmin ? 4 : 16,
          }}
        >
          <Text size="sm" c={isAdmin ? "white" : "dark"} style={{ whiteSpace: "pre-wrap" }}>
            {msg.message}
          </Text>
        </Paper>
        <Group gap={6} mt={4} justify={isAdmin ? "flex-end" : "flex-start"}>
          <Text size="xs" c="dimmed">{time}</Text>
          {isAdmin && (
            <Text size="xs" c={msg.is_read_by_user ? "blue" : "dimmed"}>
              {msg.is_read_by_user ? "✓✓" : "✓"}
            </Text>
          )}
        </Group>
      </Box>
    </Box>
  );
};

// Info item component
const InfoItem = ({ icon: Icon, label, value }) => (
  <Group gap={6} align="flex-start" wrap="nowrap">
    <Icon size={14} color="#666" style={{ marginTop: 2, flexShrink: 0 }} />
    <Stack gap={0}>
      <Text size="xs" c="dimmed">{label}</Text>
      <Text size="xs" fw={500}>{value || "-"}</Text>
    </Stack>
  </Group>
);

// Detail Modal component
const DetailModal = ({ open, onClose, konsultasi }) => {
  if (!konsultasi) return null;

  const parseJsonField = (field) => {
    if (!field) return [];
    if (typeof field === "string") {
      try { return JSON.parse(field); } catch { return []; }
    }
    return field;
  };

  const jenisPermasalahan = parseJsonField(konsultasi.jenis_permasalahan);
  const lampiran = parseJsonField(konsultasi.lampiran_dokumen);

  return (
    <Modal
      title={<Group gap="xs"><IconInfoCircle size={18} /><Text fw={600}>Detail Konsultasi</Text></Group>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Accordion variant="separated" radius="sm" defaultValue={["user", "detail"]}>
        <Accordion.Item value="user">
          <Accordion.Control icon={<IconUser size={16} />}>
            <Text size="xs" fw={600}>Informasi Pemohon</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Group gap="md" mb="sm">
              <Avatar src={konsultasi.user?.image} size="lg" radius="xl" />
              <Stack gap={0}>
                <Text fw={600}>{konsultasi.user?.username}</Text>
                <Text size="xs" c="dimmed">{konsultasi.user?.employee_number || "-"}</Text>
              </Stack>
            </Group>
            <SimpleGrid cols={2} spacing="xs">
              <InfoItem icon={IconPhone} label="No. HP" value={konsultasi.no_hp_user} />
              <InfoItem icon={IconMail} label="Email" value={konsultasi.email_user} />
            </SimpleGrid>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="detail">
          <Accordion.Control icon={<IconCategory size={16} />}>
            <Text size="xs" fw={600}>Detail Permasalahan</Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              <InfoItem icon={IconHash} label="ID Konsultasi" value={konsultasi.id} />
              <div>
                <Text size="xs" c="dimmed" mb={4}>Jenis Permasalahan</Text>
                <Group gap={4}>
                  {jenisPermasalahan.map((j, i) => <Tag key={i}>{j}</Tag>)}
                </Group>
              </div>
              <div>
                <Text size="xs" c="dimmed" mb={4}>Ringkasan Permasalahan</Text>
                <Paper p="xs" bg="gray.0" radius="sm">
                  <Text size="xs" style={{ whiteSpace: "pre-wrap" }}>
                    {konsultasi.ringkasan_permasalahan || "-"}
                  </Text>
                </Paper>
              </div>
              {lampiran.length > 0 && (
                <div>
                  <Text size="xs" c="dimmed" mb={4}>Lampiran</Text>
                  <Stack gap={4}>
                    {lampiran.map((file, i) => (
                      <a key={i} href={file.url} target="_blank" rel="noopener noreferrer">
                        <Badge leftSection={<IconFileText size={12} />} variant="light">{file.name}</Badge>
                      </a>
                    ))}
                  </Stack>
                </div>
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Modal>
  );
};

const AdminThreadsKonsultasiHukum = () => {
  useScrollRestoration();
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-konsultasi-threads", id],
    queryFn: () => getAdminKonsultasiHukumThreads(id),
    enabled: !!id,
    refetchInterval: 30000, // Refetch every 30 seconds for new messages
  });

  const { mutate: sendMessage, isLoading: sending } = useMutation({
    mutationFn: (msg) => sendAdminKonsultasiHukumMessage(id, { message: msg }),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries(["admin-konsultasi-threads", id]);
    },
    onError: (err) => {
      message.error(err?.response?.data?.message || "Gagal mengirim pesan");
    },
  });

  const konsultasi = data?.konsultasi;
  const messages = data?.messages || [];

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const statusColor = {
    Pending: "orange",
    "In Progress": "blue",
    Completed: "green",
    "Waiting for Response": "orange",
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Admin Thread Konsultasi</title>
      </Head>
      <PageContainer
        title="Thread Konsultasi Hukum"
        subTitle={konsultasi?.user?.username || "Loading..."}
        onBack={() => router.back()}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/admin/dashboard">Sapa ASN Admin</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/admin/konsultasi-hukum">Konsultasi Hukum</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Thread</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <Stack gap="md">
          {/* Header Info */}
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 1 }} />
          ) : konsultasi && (
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between" wrap="wrap">
                <Group gap="md">
                  <Avatar src={konsultasi.user?.image} size="md" radius="xl">
                    <IconUser size={20} />
                  </Avatar>
                  <Stack gap={0}>
                    <Text size="sm" fw={600}>{konsultasi.user?.username}</Text>
                    <Text size="xs" c="dimmed">{konsultasi.user?.perangkat_daerah_detail || konsultasi.id}</Text>
                  </Stack>
                </Group>
                <Group gap="sm">
                  <Tag color={statusColor[konsultasi.status] || "default"}>
                    {konsultasi.status}
                  </Tag>
                  <Button 
                    size="small" 
                    icon={<IconInfoCircle size={14} />}
                    onClick={() => setDetailOpen(true)}
                  >
                    Detail
                  </Button>
                </Group>
              </Group>
            </Paper>
          )}

          {/* Chat Area */}
          <Paper radius="md" withBorder style={{ overflow: "hidden" }}>
            <ScrollArea h={450} viewportRef={scrollRef} p="md">
              {isLoading ? (
                <Stack gap="md">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height={60} radius="md" />
                  ))}
                </Stack>
              ) : messages.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  Belum ada pesan. Mulai percakapan dengan mengirim pesan.
                </Text>
              ) : (
                messages.map((msg, idx) => (
                  <MessageBubble
                    key={idx}
                    msg={msg}
                    userImage={konsultasi?.user?.image}
                    userName={konsultasi?.user?.username}
                    isAdmin={msg.sender_type === "admin"}
                  />
                ))
              )}
            </ScrollArea>

            <Divider />

            {/* Input Area */}
            <Paper p="md" bg="gray.0">
              <Group gap="sm">
                <Input.TextArea
                  placeholder="Tulis balasan..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary"
                  icon={<IconSend size={16} />}
                  onClick={handleSend}
                  loading={sending}
                  disabled={!newMessage.trim()}
                >
                  Kirim
                </Button>
              </Group>
            </Paper>
          </Paper>
        </Stack>

        <FloatButton.BackTop />
      </PageContainer>

      {/* Detail Modal */}
      <DetailModal 
        open={detailOpen} 
        onClose={() => setDetailOpen(false)} 
        konsultasi={konsultasi} 
      />
    </>
  );
};

AdminThreadsKonsultasiHukum.getLayout = (page) => (
  <SapaASNLayout active="/sapa-asn/admin/konsultasi-hukum">{page}</SapaASNLayout>
);

AdminThreadsKonsultasiHukum.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AdminThreadsKonsultasiHukum;

import PageContainer from "@/components/PageContainer";
import SapaASNLayout from "@/components/SapaASN/SapaASNLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  getAdminKonsultasiHukumThreads,
  sendAdminKonsultasiHukumMessage,
} from "@/services/sapa-asn.services";
import {
  Avatar,
  Box,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { IconSend, IconUser } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb, Button, FloatButton, Input, message, Skeleton, Tag } from "antd";
import dayjs from "dayjs";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

const MessageBubble = ({ message, isAdmin, senderName, time }) => (
  <Group
    gap="sm"
    align="flex-start"
    justify={isAdmin ? "flex-end" : "flex-start"}
    mb="sm"
    px="md"
  >
    {!isAdmin && (
      <Avatar size="sm" radius="xl" color="blue">
        <IconUser size={14} />
      </Avatar>
    )}
    <Box maw="70%">
      <Text size="xs" c="dimmed" mb={2} ta={isAdmin ? "right" : "left"}>
        {senderName}
      </Text>
      <Paper
        p="sm"
        radius="lg"
        bg={isAdmin ? "blue.6" : "gray.1"}
        style={{
          borderTopRightRadius: isAdmin ? 4 : 16,
          borderTopLeftRadius: isAdmin ? 16 : 4,
        }}
      >
        <Text size="sm" c={isAdmin ? "white" : "dark"} style={{ whiteSpace: "pre-wrap" }}>
          {message}
        </Text>
      </Paper>
      <Text size="xs" c="dimmed" mt={2} ta={isAdmin ? "right" : "left"}>
        {dayjs(time).format("DD MMM, HH:mm")}
      </Text>
    </Box>
    {isAdmin && (
      <Avatar size="sm" radius="xl" color="blue">
        A
      </Avatar>
    )}
  </Group>
);

const AdminThreadsKonsultasiHukum = () => {
  useScrollRestoration();
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-konsultasi-threads", id],
    queryFn: () => getAdminKonsultasiHukumThreads(id),
    enabled: !!id,
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
          {/* Konsultasi Info */}
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 2 }} />
          ) : konsultasi && (
            <Paper p="md" radius="md" withBorder>
              <Group justify="space-between" wrap="wrap">
                <div>
                  <Text size="sm" fw={600}>{konsultasi.user?.username}</Text>
                  <Text size="xs" c="dimmed">{konsultasi.id}</Text>
                </div>
                <Tag color={konsultasi.status === "Completed" ? "green" : konsultasi.status === "In Progress" ? "blue" : "orange"}>
                  {konsultasi.status}
                </Tag>
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
                    message={msg.message}
                    isAdmin={msg.sender_type === "admin"}
                    senderName={msg.sender_type === "admin" ? "Admin" : konsultasi?.user?.username}
                    time={msg.created_at}
                  />
                ))
              )}
            </ScrollArea>

            {/* Input Area */}
            <Paper p="md" bg="gray.0" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
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


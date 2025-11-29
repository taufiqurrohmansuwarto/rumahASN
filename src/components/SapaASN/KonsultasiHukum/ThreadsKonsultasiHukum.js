import {
  Avatar,
  Box,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { IconSend, IconUser, IconUserShield } from "@tabler/icons-react";
import { Button, Input, Tag } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

const MessageBubble = ({ message, isUser }) => {
  const time = message.created_at
    ? dayjs(message.created_at).format("HH:mm")
    : message.time;

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: isUser ? "row" : "row-reverse",
        gap: 12,
        width: "100%",
      }}
    >
      <Avatar
        radius="xl"
        color={isUser ? "blue" : "green"}
        style={{ flexShrink: 0 }}
      >
        {isUser ? <IconUser size={18} /> : <IconUserShield size={18} />}
      </Avatar>
      <Box style={{ maxWidth: "70%" }}>
        <Text size="xs" fw={500} c={isUser ? "blue" : "green"} mb={4}>
          {message.sender_name || message.senderName || (isUser ? "User" : "Admin")}
        </Text>
        <Paper
          p="sm"
          radius="lg"
          style={{
            backgroundColor: isUser ? "#e3f2fd" : "#e8f5e9",
            borderTopLeftRadius: isUser ? 4 : 16,
            borderTopRightRadius: isUser ? 16 : 4,
          }}
        >
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
            {message.message || message.text}
          </Text>
        </Paper>
        <Text size="xs" c="dimmed" ta={isUser ? "left" : "right"} mt={4}>
          {time}
        </Text>
      </Box>
    </Box>
  );
};

const statusConfig = {
  "Waiting for Response": { color: "orange", label: "Menunggu Respon" },
  Answered: { color: "blue", label: "Sudah Dijawab" },
  Pending: { color: "gray", label: "Pending" },
  Rejected: { color: "red", label: "Ditolak" },
  Closed: { color: "green", label: "Selesai" },
};

const ThreadsKonsultasiHukum = ({
  konsultasi,
  messages = [],
  onSend,
  loading,
  pageLoading,
}) => {
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend?.(text);
    setText("");
  };

  if (pageLoading) {
    return (
      <Paper p="md" radius="md" withBorder>
        <Skeleton height={40} mb="md" />
        <Skeleton height={300} mb="md" />
        <Skeleton height={50} />
      </Paper>
    );
  }

  return (
    <Paper p="md" radius="md" withBorder>
      <Group gap="md" mb="sm" justify="space-between">
        <Group gap="xs">
          <Text fw={600}>Konsultasi #{konsultasi?.nomor_konsultasi}</Text>
          <Tag color={statusConfig[konsultasi?.status]?.color}>
            {statusConfig[konsultasi?.status]?.label || konsultasi?.status}
          </Tag>
        </Group>
        <Text size="sm" c="dimmed">
          {konsultasi?.created_at
            ? dayjs(konsultasi.created_at).format("DD MMM YYYY")
            : ""}
        </Text>
      </Group>

      {konsultasi?.ringkasan && (
        <Paper p="xs" bg="gray.0" radius="sm" mb="md">
          <Text size="xs" fw={500} c="dimmed" mb={4}>
            Ringkasan Permasalahan:
          </Text>
          <Text size="sm">{konsultasi.ringkasan}</Text>
        </Paper>
      )}

      <Divider mb="md" />

      <ScrollArea h={400} viewportRef={scrollRef} offsetScrollbars>
        <Stack gap="lg" p="xs">
          {messages.length === 0 ? (
            <Text ta="center" c="dimmed" py="xl">
              Belum ada pesan. Mulai percakapan Anda.
            </Text>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isUser={msg.sender_type === "user"}
              />
            ))
          )}
        </Stack>
      </ScrollArea>

      <Divider my="md" />

      <Group gap="sm">
        <Input
          placeholder="Ketik pesan Anda..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPressEnter={handleSend}
          style={{ flex: 1 }}
          disabled={konsultasi?.status === "Closed" || konsultasi?.status === "Rejected"}
        />
        <Button
          type="primary"
          icon={<IconSend size={16} />}
          onClick={handleSend}
          loading={loading}
          disabled={konsultasi?.status === "Closed" || konsultasi?.status === "Rejected"}
        >
          Kirim
        </Button>
      </Group>
    </Paper>
  );
};

export default ThreadsKonsultasiHukum;

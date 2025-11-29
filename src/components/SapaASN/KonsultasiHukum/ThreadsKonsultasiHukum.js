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

// Message bubble - User's messages on RIGHT, Admin's messages on LEFT
const MessageBubble = ({ msg, isMyMessage }) => {
  const time = dayjs(msg.created_at).format("DD MMM, HH:mm");

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: isMyMessage ? "row-reverse" : "row",
        gap: 10,
        marginBottom: 16,
      }}
    >
      <Avatar
        size="sm"
        radius="xl"
        color={isMyMessage ? "blue" : "green"}
        style={{ flexShrink: 0 }}
      >
        {isMyMessage ? <IconUser size={14} /> : <IconUserShield size={14} />}
      </Avatar>
      <Box style={{ maxWidth: "70%" }}>
        <Text size="xs" c="dimmed" mb={4} ta={isMyMessage ? "right" : "left"}>
          {isMyMessage ? "Anda" : "Admin"}
        </Text>
        <Paper
          p="sm"
          radius="lg"
          bg={isMyMessage ? "blue.6" : "gray.1"}
          style={{
            borderTopLeftRadius: isMyMessage ? 16 : 4,
            borderTopRightRadius: isMyMessage ? 4 : 16,
          }}
        >
          <Text size="sm" c={isMyMessage ? "white" : "dark"} style={{ whiteSpace: "pre-wrap" }}>
            {msg.message}
          </Text>
        </Paper>
        <Group gap={6} mt={4} justify={isMyMessage ? "flex-end" : "flex-start"}>
          <Text size="xs" c="dimmed">{time}</Text>
          {isMyMessage && (
            <Text size="xs" c={msg.is_read_by_admin ? "blue" : "dimmed"}>
              {msg.is_read_by_admin ? "✓✓" : "✓"}
            </Text>
          )}
        </Group>
      </Box>
    </Box>
  );
};

const statusConfig = {
  "Waiting for Response": { color: "orange", label: "Menunggu Respon" },
  "In Progress": { color: "blue", label: "Diproses" },
  Answered: { color: "cyan", label: "Sudah Dijawab" },
  Pending: { color: "gray", label: "Pending" },
  Rejected: { color: "red", label: "Ditolak" },
  Closed: { color: "green", label: "Selesai" },
  Completed: { color: "green", label: "Selesai" },
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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

  const isClosed = konsultasi?.status === "Closed" || 
                   konsultasi?.status === "Rejected" || 
                   konsultasi?.status === "Completed";

  return (
    <Paper p="md" radius="md" withBorder>
      {/* Header */}
      <Group gap="md" mb="sm" justify="space-between">
        <Group gap="xs">
          <Text fw={600}>Konsultasi #{konsultasi?.nomor_konsultasi || konsultasi?.id}</Text>
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

      <Divider mb="md" />

      {/* Chat Area */}
      <ScrollArea h={400} viewportRef={scrollRef} offsetScrollbars>
        <Stack gap="sm" p="xs">
          {messages.length === 0 ? (
            <Text ta="center" c="dimmed" py="xl">
              Belum ada pesan. Mulai percakapan Anda.
            </Text>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMyMessage={msg.sender_type === "user"}
              />
            ))
          )}
        </Stack>
      </ScrollArea>

      <Divider my="md" />

      {/* Input Area */}
      <Group gap="sm">
        <Input.TextArea
          placeholder="Ketik pesan Anda..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ flex: 1 }}
          disabled={isClosed}
        />
        <Button
          type="primary"
          icon={<IconSend size={16} />}
          onClick={handleSend}
          loading={loading}
          disabled={isClosed || !text.trim()}
        >
          Kirim
        </Button>
      </Group>

      {isClosed && (
        <Text size="xs" c="dimmed" ta="center" mt="sm">
          Konsultasi ini sudah ditutup. Anda tidak dapat mengirim pesan lagi.
        </Text>
      )}
    </Paper>
  );
};

export default ThreadsKonsultasiHukum;

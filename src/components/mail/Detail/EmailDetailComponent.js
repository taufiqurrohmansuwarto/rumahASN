import {
  useDeleteEmail,
  useMarkAsUnread,
  useMoveToFolder,
  useToggleStar,
} from "@/hooks/useEmails";
import { Avatar, Box, Center, Divider, Group, Paper, Popover, Stack, Text } from "@mantine/core";
import {
  IconArchive,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconChevronDown,
  IconClock,
  IconMail,
  IconPaperclip,
  IconStar,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";
import { Button, Spin, Tooltip, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useRouter } from "next/router";
import EmailAttachmentsDisplay from "./EmailAttachmentsDisplay";
import EmailLabelSelector from "./EmailLabelSelector";

dayjs.locale("id");

const EmailDetailComponent = ({
  email,
  loading = false,
  error = null,
  onRefresh,
}) => {
  const router = useRouter();

  const toggleStarMutation = useToggleStar();
  const deleteEmailMutation = useDeleteEmail();
  const moveToFolderMutation = useMoveToFolder();
  const markAsUnreadMutation = useMarkAsUnread();

  const handleToggleStar = async () => {
    try {
      await toggleStarMutation.mutateAsync(email.id);
      onRefresh?.();
    } catch {
      message.error("Gagal");
    }
  };

  const handleMarkAsUnread = async () => {
    try {
      await markAsUnreadMutation.mutateAsync(email.id);
      message.success("Ditandai belum dibaca");
      router.back();
    } catch {
      message.error("Gagal");
    }
  };

  const handleReply = (replyAll = false) => {
    const queryParams = new URLSearchParams({
      reply: email.id,
      ...(replyAll && { replyAll: "true" }),
    });
    router.push(`/mails/compose?${queryParams.toString()}`);
  };

  const handleForward = () => {
    router.push(`/mails/compose?forward=${email.id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteEmailMutation.mutateAsync({ emailId: email.id, permanent: false });
      message.success("Dipindahkan ke sampah");
      router.back();
    } catch {
      message.error("Gagal");
    }
  };

  const handleArchive = async () => {
    try {
      await moveToFolderMutation.mutateAsync({ emailId: email.id, folder: "archive" });
      message.success("Diarsipkan");
      router.back();
    } catch {
      message.error("Gagal");
    }
  };

  const formatDate = (date) => {
    const now = dayjs();
    const emailDate = dayjs(date);
    if (now.diff(emailDate, "day") === 0) {
      return emailDate.format("HH:mm");
    }
    return emailDate.format("D MMM YYYY, HH:mm");
  };

  if (loading) {
    return (
      <Center>
        <Paper p="md" withBorder style={{ maxWidth: 800, width: "100%" }}>
          <Center mih={200}>
            <Spin />
          </Center>
        </Paper>
      </Center>
    );
  }

  if (error || !email) {
    return (
      <Center>
        <Paper p="md" withBorder style={{ maxWidth: 800, width: "100%" }}>
          <Stack align="center" gap="xs">
            <IconMail size={32} style={{ color: "#ced4da" }} />
            <Text c="dimmed" size="sm">Email tidak ditemukan</Text>
            <Button size="small" onClick={() => router.back()}>
              Kembali
            </Button>
          </Stack>
        </Paper>
      </Center>
    );
  }

  const senderName = email.sender?.username || email.sender_name || "?";
  const senderImage = email.sender?.image || email.sender_image;
  const recipientsTo = email.recipients?.to || [];
  const recipientsCc = email.recipients?.cc || [];
  
  // Format recipients - handle both serialized and raw format
  const formatRecipients = (list) => {
    if (!list || list.length === 0) return "saya";
    return list.map((r) => r.user?.username || r.name || "?").join(", ");
  };

  return (
    <Center>
      <Paper withBorder style={{ maxWidth: 800, width: "100%" }}>
        {/* Header Actions */}
        <Group justify="space-between" p={8} style={{ borderBottom: "1px solid #f0f0f0" }}>
          <Group gap={4}>
            <Tooltip title={email.is_starred ? "Hapus bintang" : "Beri bintang"}>
              <Button
                type="text"
                size="small"
                onClick={handleToggleStar}
                loading={toggleStarMutation.isLoading}
                icon={
                  email.is_starred ? (
                    <IconStarFilled size={14} style={{ color: "#fab005" }} />
                  ) : (
                    <IconStar size={14} />
                  )
                }
              />
            </Tooltip>
            <Tooltip title="Tandai belum dibaca">
              <Button
                type="text"
                size="small"
                onClick={handleMarkAsUnread}
                loading={markAsUnreadMutation.isLoading}
                icon={<IconMail size={14} />}
              />
            </Tooltip>
            <Tooltip title="Arsipkan">
              <Button
                type="text"
                size="small"
                onClick={handleArchive}
                loading={moveToFolderMutation.isLoading}
                icon={<IconArchive size={14} />}
              />
            </Tooltip>
            <Tooltip title="Hapus">
              <Button
                type="text"
                size="small"
                danger
                onClick={handleDelete}
                loading={deleteEmailMutation.isLoading}
                icon={<IconTrash size={14} />}
              />
            </Tooltip>
          </Group>
          <EmailLabelSelector emailId={email.id} onRefresh={onRefresh} />
        </Group>

        {/* Sender Info */}
        <Box p="sm">
          <Group justify="space-between" align="flex-start">
            <Group gap={10}>
              <Avatar size={36} radius="xl" src={senderImage} color="blue">
                {senderName.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Text size="sm" fw={600}>
                  {senderName}
                </Text>
                <Popover position="bottom-start" withArrow width={320}>
                  <Popover.Target>
                    <Group gap={2} style={{ cursor: "pointer" }}>
                      <Text size="xs" c="dimmed">
                        kepada {formatRecipients(recipientsTo)}
                      </Text>
                      <IconChevronDown size={12} style={{ color: "#868e96" }} />
                    </Group>
                  </Popover.Target>
                  <Popover.Dropdown p="sm">
                    <Stack gap={6}>
                      <Group gap={8} align="flex-start">
                        <Text size="xs" c="dimmed" w={50} ta="right">dari:</Text>
                        <Text size="xs" fw={500}>{senderName}</Text>
                      </Group>
                      <Group gap={8} align="flex-start">
                        <Text size="xs" c="dimmed" w={50} ta="right">kepada:</Text>
                        <Text size="xs">{formatRecipients(recipientsTo)}</Text>
                      </Group>
                      {recipientsCc.length > 0 && (
                        <Group gap={8} align="flex-start">
                          <Text size="xs" c="dimmed" w={50} ta="right">cc:</Text>
                          <Text size="xs">{formatRecipients(recipientsCc)}</Text>
                        </Group>
                      )}
                      <Group gap={8} align="flex-start">
                        <Text size="xs" c="dimmed" w={50} ta="right">tanggal:</Text>
                        <Text size="xs">{dayjs(email.created_at).format("D MMM YYYY, HH:mm")}</Text>
                      </Group>
                      <Group gap={8} align="flex-start">
                        <Text size="xs" c="dimmed" w={50} ta="right">subjek:</Text>
                        <Text size="xs">{email.subject}</Text>
                      </Group>
                    </Stack>
                  </Popover.Dropdown>
                </Popover>
              </Box>
            </Group>
            <Group gap={4}>
              <IconClock size={12} style={{ color: "#868e96" }} />
              <Text size="xs" c="dimmed">
                {formatDate(email.created_at)}
              </Text>
            </Group>
          </Group>
        </Box>

        <Divider />

        {/* Content */}
        <Box p="sm" style={{ minHeight: 150 }}>
          <Text size="sm" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {email.content || "(Tidak ada konten)"}
          </Text>
        </Box>

        {/* Attachments */}
        {email.attachments?.length > 0 && (
          <>
            <Divider />
            <Box p="sm">
              <Group gap={4} mb={8}>
                <IconPaperclip size={12} />
                <Text size="xs" c="dimmed">
                  {email.attachments.length} lampiran
                </Text>
              </Group>
              <EmailAttachmentsDisplay attachments={email.attachments} />
            </Box>
          </>
        )}

        {/* Action Buttons */}
        <Group p={8} style={{ borderTop: "1px solid #f0f0f0", backgroundColor: "#fafafa" }}>
          <Button
            size="small"
            type="primary"
            icon={<IconArrowBackUp size={14} />}
            onClick={() => handleReply(false)}
          >
            Balas
          </Button>
          <Button
            size="small"
            icon={<IconArrowForwardUp size={14} />}
            onClick={handleForward}
          >
            Teruskan
          </Button>
        </Group>
      </Paper>
    </Center>
  );
};

export default EmailDetailComponent;

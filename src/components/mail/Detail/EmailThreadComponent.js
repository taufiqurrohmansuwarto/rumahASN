// src/components/mail/Detail/EmailThreadComponent.js
import {
  useDeleteEmail,
  useMarkAsUnread,
  useMoveToFolder,
  useToggleStar,
} from "@/hooks/useEmails";
import {
  Avatar,
  Box,
  Group,
  Paper,
  Popover,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconArchive,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconChevronDown,
  IconClock,
  IconDots,
  IconMail,
  IconPaperclip,
  IconStar,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";
import { Button, Dropdown, Tooltip, message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useState } from "react";
import EmailAttachmentsDisplay from "./EmailAttachmentsDisplay";

dayjs.locale("id");

// Single email item dalam thread - style Gmail
const ThreadEmailItem = ({
  email,
  isLatest,
  onReply,
  onReplyAll,
  onForward,
}) => {
  const [expanded, setExpanded] = useState(isLatest);
  const toggleStarMutation = useToggleStar();
  const deleteEmailMutation = useDeleteEmail();
  const markAsUnreadMutation = useMarkAsUnread();
  const moveToFolderMutation = useMoveToFolder();

  const senderName = email.sender?.username || email.sender_name || "?";
  const senderImage = email.sender?.image || email.sender_image;
  const recipientsTo = email.recipients?.to || [];
  const recipientsCc = email.recipients?.cc || [];

  const formatDate = (date) => {
    const now = dayjs();
    const emailDate = dayjs(date);
    if (now.diff(emailDate, "day") === 0) {
      return emailDate.format("HH:mm");
    }
    if (now.diff(emailDate, "day") < 7) {
      return emailDate.format("ddd, HH:mm");
    }
    return emailDate.format("D MMM YYYY, HH:mm");
  };

  const formatRecipients = (list) => {
    if (!list || list.length === 0) return "saya";
    return list.map((r) => r.user?.username || r.name || "?").join(", ");
  };

  const getContentPreview = () => {
    const content = email.content || "";
    return content.length > 80 ? content.substring(0, 80) + "..." : content;
  };

  const handleToggleStar = async (e) => {
    e?.stopPropagation?.();
    try {
      await toggleStarMutation.mutateAsync(email.id);
    } catch {}
  };

  const handleDelete = async () => {
    try {
      await deleteEmailMutation.mutateAsync({ emailId: email.id, permanent: false });
      message.success("Dipindahkan ke sampah");
    } catch {
      message.error("Gagal menghapus");
    }
  };

  const handleMarkUnread = async () => {
    try {
      await markAsUnreadMutation.mutateAsync(email.id);
      message.success("Ditandai belum dibaca");
    } catch {
      message.error("Gagal");
    }
  };

  const handleArchive = async () => {
    try {
      await moveToFolderMutation.mutateAsync({ emailId: email.id, folder: "archive" });
      message.success("Diarsipkan");
    } catch {
      message.error("Gagal mengarsipkan");
    }
  };

  // Dropdown menu items
  const moreMenuItems = [
    {
      key: "reply",
      icon: <IconArrowBackUp size={14} />,
      label: "Balas",
      onClick: () => onReply?.(email),
    },
    {
      key: "forward",
      icon: <IconArrowForwardUp size={14} />,
      label: "Teruskan",
      onClick: () => onForward?.(email),
    },
    { type: "divider" },
    {
      key: "unread",
      icon: <IconMail size={14} />,
      label: "Tandai belum dibaca",
      onClick: handleMarkUnread,
    },
    {
      key: "star",
      icon: email.is_starred ? <IconStarFilled size={14} style={{ color: "#fab005" }} /> : <IconStar size={14} />,
      label: email.is_starred ? "Hapus bintang" : "Beri bintang",
      onClick: handleToggleStar,
    },
    { type: "divider" },
    {
      key: "archive",
      icon: <IconArchive size={14} />,
      label: "Arsipkan",
      onClick: handleArchive,
    },
    {
      key: "delete",
      icon: <IconTrash size={14} />,
      label: "Hapus",
      danger: true,
      onClick: handleDelete,
    },
  ];

  // Collapsed view - seperti Gmail
  if (!expanded) {
    return (
      <UnstyledButton
        w="100%"
        onClick={() => setExpanded(true)}
        style={{
          borderBottom: "1px solid #f0f0f0",
          padding: "10px 12px",
          transition: "background 0.15s",
          "&:hover": { backgroundColor: "#f8f9fa" },
        }}
      >
        <Group gap="sm" wrap="nowrap">
          <Avatar src={senderImage} radius="xl" size={32} color="blue">
            {senderName.charAt(0).toUpperCase()}
          </Avatar>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap={6} wrap="nowrap">
              <Text size="xs" fw={email.is_read ? 400 : 600} truncate>
                {senderName}
              </Text>
              <Text size="xs" c="dimmed" truncate style={{ flex: 1 }}>
                — {getContentPreview()}
              </Text>
            </Group>
          </Box>
          <Group gap={4}>
            {email.attachments?.length > 0 && (
              <IconPaperclip size={14} style={{ color: "#868e96" }} />
            )}
            <Text size="xs" c="dimmed">
              {formatDate(email.created_at)}
            </Text>
          </Group>
        </Group>
      </UnstyledButton>
    );
  }

  // Expanded view - detail email
  return (
    <Box style={{ borderBottom: "1px solid #e9ecef" }}>
      {/* Header */}
      <Box px="sm" py="xs" style={{ backgroundColor: "#fafafa" }}>
        <Group justify="space-between" align="flex-start">
          <Group gap={10}>
            <Avatar src={senderImage} size={36} radius="xl" color="blue">
              {senderName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Text size="sm" fw={600}>
                {senderName}
              </Text>
              <Popover position="bottom-start" withArrow width={280}>
                <Popover.Target>
                  <Group gap={2} style={{ cursor: "pointer" }}>
                    <Text size="xs" c="dimmed">
                      kepada {formatRecipients(recipientsTo)}
                    </Text>
                    <IconChevronDown size={12} style={{ color: "#868e96" }} />
                  </Group>
                </Popover.Target>
                <Popover.Dropdown p="xs">
                  <Stack gap={4}>
                    <Group gap={6}>
                      <Text size="xs" c="dimmed" w={45}>dari:</Text>
                      <Text size="xs" fw={500}>{senderName}</Text>
                    </Group>
                    <Group gap={6}>
                      <Text size="xs" c="dimmed" w={45}>kepada:</Text>
                      <Text size="xs">{formatRecipients(recipientsTo)}</Text>
                    </Group>
                    {recipientsCc.length > 0 && (
                      <Group gap={6}>
                        <Text size="xs" c="dimmed" w={45}>cc:</Text>
                        <Text size="xs">{formatRecipients(recipientsCc)}</Text>
                      </Group>
                    )}
                    <Group gap={6}>
                      <Text size="xs" c="dimmed" w={45}>tanggal:</Text>
                      <Text size="xs">{dayjs(email.created_at).format("D MMM YYYY, HH:mm")}</Text>
                    </Group>
                  </Stack>
                </Popover.Dropdown>
              </Popover>
            </Box>
          </Group>

          <Group gap={6}>
            <Group gap={2}>
              <IconClock size={12} style={{ color: "#868e96" }} />
              <Text size="xs" c="dimmed">
                {formatDate(email.created_at)}
              </Text>
            </Group>
            <Tooltip title={email.is_starred ? "Hapus bintang" : "Beri bintang"}>
              <UnstyledButton onClick={handleToggleStar}>
                {email.is_starred ? (
                  <IconStarFilled size={16} style={{ color: "#fab005" }} />
                ) : (
                  <IconStar size={16} style={{ color: "#adb5bd" }} />
                )}
              </UnstyledButton>
            </Tooltip>
            <Tooltip title="Balas">
              <UnstyledButton onClick={() => onReply?.(email)}>
                <IconArrowBackUp size={16} style={{ color: "#868e96" }} />
              </UnstyledButton>
            </Tooltip>
            <Dropdown
              menu={{ items: moreMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Tooltip title="Lainnya">
                <UnstyledButton>
                  <IconDots size={16} style={{ color: "#868e96" }} />
                </UnstyledButton>
              </Tooltip>
            </Dropdown>
            <Tooltip title="Tutup">
              <UnstyledButton onClick={() => setExpanded(false)}>
                <IconChevronDown size={16} style={{ color: "#868e96", transform: "rotate(180deg)" }} />
              </UnstyledButton>
            </Tooltip>
          </Group>
        </Group>
      </Box>

      {/* Content */}
      <Box px="sm" py="md">
        <Text size="sm" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
          {email.content || "(Tidak ada konten)"}
        </Text>
      </Box>

      {/* Attachments */}
      {email.attachments?.length > 0 && (
        <Box px="sm" pb="sm">
          <Group gap={4} mb={6}>
            <IconPaperclip size={12} />
            <Text size="xs" c="dimmed">
              {email.attachments.length} lampiran
            </Text>
          </Group>
          <EmailAttachmentsDisplay attachments={email.attachments} />
        </Box>
      )}

      {/* Action Buttons */}
      <Group px="sm" pb="sm" gap={8}>
        <Button
          size="small"
          icon={<IconArrowBackUp size={14} />}
          onClick={() => onReply?.(email)}
        >
          Balas
        </Button>
        <Button
          size="small"
          icon={<IconArrowForwardUp size={14} />}
          onClick={() => onForward?.(email)}
        >
          Teruskan
        </Button>
      </Group>
    </Box>
  );
};

// Main thread component
const EmailThreadComponent = ({
  emailId,
  threadData,
  onReply,
  onReplyAll,
  onForward,
}) => {
  if (!threadData || !threadData.thread_emails) return null;

  const { thread_emails, current_email_id, thread_count } = threadData;

  // Flatten thread dan sort by created_at
  const flattenThread = (emails) => {
    const flattened = [];
    const processEmail = (email) => {
      flattened.push(email);
      if (email.replies?.length > 0) {
        email.replies.forEach(processEmail);
      }
    };
    emails.forEach(processEmail);
    return flattened.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  };

  const flatEmails = flattenThread(thread_emails);

  return (
    <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
      {/* Thread Header - hanya tampil jika ada lebih dari 1 email */}
      {thread_count > 1 && (
        <Box
          px="sm"
          py={6}
          style={{
            backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #e9ecef",
          }}
        >
          <Text size="xs" c="dimmed">
            {thread_count} pesan dalam percakapan ini
          </Text>
        </Box>
      )}

      {/* Thread Emails */}
      <Box style={{ maxHeight: "calc(100vh - 260px)", overflowY: "auto" }}>
        {flatEmails.map((email, index) => (
          <ThreadEmailItem
            key={email.id}
            email={email}
            isLatest={index === flatEmails.length - 1}
            onReply={onReply}
            onReplyAll={onReplyAll}
            onForward={onForward}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default EmailThreadComponent;

// src/components/mail/Detail/EmailThreadComponent.js
import {
  useDeleteEmail,
  useMarkAsRead,
  useMarkAsUnread,
  useMoveToFolder,
  useToggleStar,
  useUpdatePriority,
} from "@/hooks/useEmails";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  Avatar,
  Badge,
  Box,
  Chip,
  Collapse,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconMessages,
  IconPaperclip,
} from "@tabler/icons-react";
import { message } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useState } from "react";
import EmailActionButtons from "./EmailActionButtons";
import EmailAttachmentsDisplay from "./EmailAttachmentsDisplay";
import EmailContentDisplay from "./EmailContentDisplay";
import EmailDetailHeader from "./EmailDetailHeader";

// Single email in thread
const ThreadEmailItem = ({
  email,
  isCurrentEmail,
  isLatest,
  onReply,
  onReplyAll,
  onForward,
  threadEmails,
  currentIndex,
}) => {
  const toggleStarMutation = useToggleStar();
  const deleteEmailMutation = useDeleteEmail();
  const moveToFolderMutation = useMoveToFolder();
  const markAsUnreadMutation = useMarkAsUnread();
  const markAsReadMutation = useMarkAsRead();
  const updatePriorityMutation = useUpdatePriority();

  const [expanded, setExpanded] = useState(isLatest || isCurrentEmail);

  const formatTime = (date) => dayjs(date).format("D MMM YYYY, HH:mm");

  const getRecipientSummary = () => {
    const toCount = email.recipients?.to?.length || 0;
    const ccCount = email.recipients?.cc?.length || 0;

    if (toCount === 0) return "";
    if (toCount === 1 && ccCount === 0) {
      return `ke ${email.recipients.to[0]?.user?.username || "Tidak dikenal"}`;
    }
    let summary = `ke ${toCount} orang`;
    if (ccCount > 0) summary += `, cc ${ccCount}`;
    return summary;
  };

  const isReplyEmail = () => {
    if (email.parent_id) return true;
    if (email.in_reply_to) return true;
    if (email.references?.length) return true;
    if ((email.subject || "").toLowerCase().includes("re:")) return true;
    if (
      currentIndex > 0 &&
      (email.content || "").match(/(Pada .+? menulis:|On .+? wrote:)/)
    )
      return true;
    return false;
  };

  const getQuotedContent = () => {
    if (currentIndex === 0) return "";

    let parentEmail = null;

    if (email.parent_id) {
      parentEmail = threadEmails.find((e) => e.id === email.parent_id);
    }
    if (!parentEmail && email.in_reply_to) {
      parentEmail = threadEmails.find((e) => e.id === email.in_reply_to);
    }
    if (!parentEmail && email.references) {
      const refs = Array.isArray(email.references)
        ? email.references
        : [email.references];
      for (const ref of refs) {
        parentEmail = threadEmails.find((e) => e.id === ref);
        if (parentEmail) break;
      }
    }
    if (!parentEmail && currentIndex > 0) {
      parentEmail = threadEmails[currentIndex - 1];
    }

    if (!parentEmail) return "";

    const senderName = parentEmail.sender?.username || "Tidak dikenal";
    const formattedDate = dayjs(parentEmail.created_at)
      .locale("id")
      .format("ddd, D MMM YYYY [pukul] HH:mm");

    return `Pada ${formattedDate} ${senderName} menulis:

${parentEmail.content || ""}`;
  };

  const getFullContent = () => {
    const currentContent = email.content || "";
    if (!isReplyEmail()) return currentContent;
    const quotedContent = getQuotedContent();
    if (!quotedContent) return currentContent;
    return `${currentContent}

${quotedContent}`;
  };

  const handleToggleStar = async () => {
    try {
      await toggleStarMutation.mutateAsync(email.id);
    } catch {
      message.error("Gagal");
    }
  };

  const handleUpdatePriority = async (priority) => {
    try {
      await updatePriorityMutation.mutateAsync({ emailId: email.id, priority });
    } catch {
      message.error("Gagal");
    }
  };

  const handleMarkAsUnread = async () => {
    try {
      await markAsUnreadMutation.mutateAsync(email.id);
    } catch {
      message.error("Gagal");
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await markAsReadMutation.mutateAsync(email.id);
    } catch {
      message.error("Gagal");
    }
  };

  const handleMoveToFolder = async (folder) => {
    try {
      await moveToFolderMutation.mutateAsync({ emailId: email.id, folder });
    } catch {
      message.error("Gagal");
    }
  };

  const handleReplyAction = (replyAll = false) => {
    if (replyAll) {
      onReplyAll?.(email);
    } else {
      onReply?.(email);
    }
  };

  const handleForward = () => onForward?.(email);

  const senderName = email.sender?.username || "Tidak dikenal";

  return (
    <Paper
      withBorder
      mb="sm"
      radius="md"
      style={{
        borderColor: isCurrentEmail ? "#228be6" : undefined,
        borderWidth: isCurrentEmail ? 2 : 1,
      }}
    >
      {/* Collapsed Header */}
      {!expanded && (
        <UnstyledButton
          w="100%"
          p="sm"
          onClick={() => setExpanded(true)}
          style={{ borderRadius: 8 }}
        >
          <Group justify="space-between">
            <Group gap="sm">
              <Avatar
                src={email.sender?.image}
                radius="xl"
                size="sm"
                color="blue"
              >
                {senderName.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Group gap="xs">
                  <Text size="sm" fw={500}>
                    {senderName}
                  </Text>
                  {isCurrentEmail && (
                    <Chip size="xs" checked={false} color="blue">
                      Saat ini
                    </Chip>
                  )}
                  {!email.is_read && (
                    <Badge size="xs" variant="dot" color="blue" />
                  )}
                </Group>
                <Group gap="xs">
                  <Text size="xs" c="dimmed">
                    {getRecipientSummary()}
                  </Text>
                  <Text size="xs" c="dimmed">
                    • {formatTime(email.created_at)}
                  </Text>
                </Group>
              </Box>
            </Group>

            <Group gap="xs">
              {email.attachments?.length > 0 && (
                <Chip size="xs" checked={false} variant="light">
                  <IconPaperclip size={12} />
                  {email.attachments.length}
                </Chip>
              )}
              <IconChevronDown size={16} style={{ color: "#868e96" }} />
            </Group>
          </Group>
        </UnstyledButton>
      )}

      {/* Expanded Content */}
      <Collapse in={expanded}>
        <Box p="md">
          <Group justify="flex-end" mb="xs">
            <UnstyledButton onClick={() => setExpanded(false)}>
              <IconChevronUp size={16} style={{ color: "#868e96" }} />
            </UnstyledButton>
          </Group>

          <EmailDetailHeader
            email={email}
            onToggleStar={handleToggleStar}
            isStarLoading={toggleStarMutation.isLoading}
            onToggleRead={handleMarkAsRead}
            isReadLoading={markAsReadMutation.isLoading}
            onToggleUnread={handleMarkAsUnread}
            isUnreadLoading={markAsUnreadMutation.isLoading}
            onMoveToFolder={handleMoveToFolder}
            isMoveToFolderLoading={moveToFolderMutation.isLoading}
            recipients={email.recipients}
            onRefresh={() => {}}
            onUpdatePriority={handleUpdatePriority}
            isUpdatePriorityLoading={updatePriorityMutation.isLoading}
          />

          <Paper p="sm" bg="gray.0" radius="sm" mb="md">
            <EmailContentDisplay content={getFullContent()} />
          </Paper>

          {email.attachments?.length > 0 && (
            <EmailAttachmentsDisplay attachments={email.attachments} />
          )}

          <Divider my="sm" />

          <EmailActionButtons
            email={email}
            onReply={handleReplyAction}
            onReplyAll={() => handleReplyAction(true)}
            onForward={handleForward}
            loading={{}}
          />
        </Box>
      </Collapse>
    </Paper>
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
  useScrollRestoration();

  if (!threadData || !threadData.thread_emails) return null;

  const { thread_emails, current_email_id, thread_count, thread_subject } =
    threadData;

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
    <Stack gap="sm">
      {/* Thread Header */}
      {thread_count > 1 && (
        <Paper p="sm" withBorder radius="md" bg="gray.0">
          <Group gap="xs" mb={4}>
            <IconMessages size={18} style={{ color: "#228be6" }} />
            <Title order={5} c="blue">
              Percakapan ({thread_count})
            </Title>
          </Group>
          {thread_subject && (
            <Text size="xs" c="dimmed">
              {thread_subject}
            </Text>
          )}
        </Paper>
      )}

      {/* Thread Emails */}
      <Box
        style={{
          maxHeight: "calc(100vh - 280px)",
          overflowY: "auto",
          paddingRight: 8,
        }}
      >
        {flatEmails.map((email, index) => (
          <ThreadEmailItem
            key={email.id}
            email={email}
            isCurrentEmail={email.id === current_email_id}
            isLatest={index === flatEmails.length - 1}
            onReply={onReply}
            onReplyAll={onReplyAll}
            onForward={onForward}
            threadEmails={flatEmails}
            currentIndex={index}
          />
        ))}
      </Box>
    </Stack>
  );
};

export default EmailThreadComponent;

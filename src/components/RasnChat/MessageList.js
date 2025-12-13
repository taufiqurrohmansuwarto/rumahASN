import { useMessages, useToggleReaction, useTogglePinMessage, useThreadMessages } from "@/hooks/useRasnChat";
import { Skeleton, Dropdown, Popover, Avatar as AntAvatar, Drawer, Empty } from "antd";
import { Stack, Text, Group, Avatar, Box, ActionIcon, Paper } from "@mantine/core";
import {
  IconDotsVertical,
  IconPin,
  IconEdit,
  IconTrash,
  IconMessageReply,
  IconMoodSmile,
  IconFile,
  IconMicrophone,
  IconMessage,
  IconSubtask,
  IconMail,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

dayjs.extend(relativeTime);
dayjs.locale("id");

const COMMON_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🎉", "👀", "🔥"];

// Mention component with hover card - match by full username
const MentionTag = ({ username, mentions }) => {
  const [hovered, setHovered] = useState(false);

  const cleanUsername = username.slice(1); // remove @
  
  // Find mention by matching full username
  const mentionInfo = mentions?.find((m) => {
    const userFullname = m.mentioned_user?.username || "";
    return userFullname.toLowerCase() === cleanUsername.toLowerCase();
  });
  const user = mentionInfo?.mentioned_user;

  const popoverContent = user ? (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 6 }}>
      <AntAvatar src={user.image} size={40}>
        {user.username?.[0]?.toUpperCase()}
      </AntAvatar>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1d1c1d" }}>{user.username}</div>
        {user.info?.nama && (
          <div style={{ fontSize: 12, color: "#616061" }}>{user.info.nama}</div>
        )}
        {user.info?.nip && (
          <div style={{ fontSize: 11, color: "#888" }}>NIP: {user.info.nip}</div>
        )}
        {user.info?.jabatan?.nama && (
          <div style={{ fontSize: 11, color: "#888" }}>{user.info.jabatan.nama}</div>
        )}
        {user.info?.perangkat_daerah?.detail && (
          <div style={{ fontSize: 10, color: "#999" }}>{user.info.perangkat_daerah.detail}</div>
        )}
      </div>
    </div>
  ) : (
    <div style={{ padding: 4 }}>
      <div style={{ fontSize: 12, color: "#666" }}>@{cleanUsername}</div>
      <div style={{ fontSize: 11, color: "#999" }}>User tidak ditemukan</div>
    </div>
  );

  const mentionSpan = (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color: "#1264a3",
        backgroundColor: hovered ? "#cce5ff" : "#e8f5fa",
        padding: "1px 4px",
        borderRadius: 3,
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.15s",
        fontSize: 12,
      }}
    >
      @{cleanUsername}
    </span>
  );

  return (
    <Popover content={popoverContent} trigger="hover" placement="top">
      {mentionSpan}
    </Popover>
  );
};

// Process text to convert @mentions to React elements
// Matches @username where username can contain letters, numbers, spaces, dots, underscores
const processTextWithMentions = (text, mentions) => {
  if (typeof text !== "string") return text;
  
  // Build regex from known mentions to properly match usernames with spaces
  const mentionUsernames = mentions?.map(m => m.mentioned_user?.username).filter(Boolean) || [];
  
  if (mentionUsernames.length === 0) {
    // Fallback: match @word pattern
    const regex = /@[\w]+/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <MentionTag key={match.index} username={match[0]} mentions={mentions} />
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  }

  // Sort by length descending to match longer usernames first
  const sortedUsernames = [...mentionUsernames].sort((a, b) => b.length - a.length);
  
  // Create pattern to match known usernames
  const escapedUsernames = sortedUsernames.map(u => 
    u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const pattern = new RegExp(`@(${escapedUsernames.join('|')})`, 'gi');
  
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <MentionTag key={match.index} username={match[0]} mentions={mentions} />
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

// Compact markdown components for chat
const createMarkdownComponents = (mentions) => ({
  p: ({ children }) => (
    <span style={{ display: "inline" }}>
      {Array.isArray(children)
        ? children.map((child, i) =>
            typeof child === "string" ? (
              <span key={i}>{processTextWithMentions(child, mentions)}</span>
            ) : (
              child
            )
          )
        : typeof children === "string"
        ? processTextWithMentions(children, mentions)
        : children}
    </span>
  ),
  strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  code: ({ children }) => (
    <code
      style={{
        backgroundColor: "#f4f4f4",
        padding: "1px 4px",
        borderRadius: 3,
        fontSize: 11,
        fontFamily: "monospace",
      }}
    >
      {children}
    </code>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "#1890ff", textDecoration: "none" }}
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: "2px 0", paddingLeft: 16, fontSize: 12 }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: "2px 0", paddingLeft: 16, fontSize: 12 }}>{children}</ol>
  ),
  li: ({ children }) => <li style={{ margin: 0 }}>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: "2px 0",
        paddingLeft: 8,
        borderLeft: "2px solid #ddd",
        color: "#666",
        fontSize: 12,
      }}
    >
      {children}
    </blockquote>
  ),
});

// Message content with markdown
const MessageContent = ({ content, mentions }) => {
  if (!content) return null;

  return (
    <Box
      style={{
        wordBreak: "break-word",
        lineHeight: 1.4,
        fontSize: 12,
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={createMarkdownComponents(mentions)}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

// Attachment preview component
const AttachmentPreview = ({ attachment }) => {
  const { attachment_type, file_name, file_url, thumbnail_url } = attachment;

  if (attachment_type === "image") {
    return (
      <a href={file_url} target="_blank" rel="noopener noreferrer">
        <img
          src={thumbnail_url || file_url}
          alt={file_name}
          style={{
            maxWidth: 280,
            maxHeight: 160,
            borderRadius: 6,
            marginTop: 4,
            border: "1px solid #e8e8e8",
          }}
        />
      </a>
    );
  }

  if (attachment_type === "video") {
    return (
      <video
        controls
        style={{
          maxWidth: 280,
          marginTop: 4,
          borderRadius: 6,
          border: "1px solid #e8e8e8",
        }}
      >
        <source src={file_url} />
      </video>
    );
  }

  if (attachment_type === "voice") {
    return (
      <Group gap={4} mt={4}>
        <IconMicrophone size={14} color="#666" />
        <audio controls style={{ height: 28 }}>
          <source src={file_url} />
        </audio>
      </Group>
    );
  }

  return (
    <Paper
      withBorder
      p={4}
      mt={4}
      radius="sm"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#f9f9f9",
      }}
    >
      <IconFile size={14} color="#666" />
      <a
        href={file_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#1890ff", textDecoration: "none", fontSize: 11 }}
      >
        {file_name}
      </a>
    </Paper>
  );
};

// Reaction pill
const ReactionPill = ({ emoji, count, users, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={users.join(", ")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: "1px 6px",
        borderRadius: 10,
        backgroundColor: hovered ? "#e6e6e6" : "#f0f0f0",
        border: `1px solid ${hovered ? "#d0d0d0" : "#e0e0e0"}`,
        cursor: "pointer",
        fontSize: 11,
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 12 }}>{emoji}</span>
      <span style={{ color: "#666", fontWeight: 500 }}>{count}</span>
    </Box>
  );
};

// Reactions component
const MessageReactions = ({ reactions, messageId, onReact }) => {
  if (!reactions?.length) return null;

  const grouped = reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
    acc[r.emoji].count++;
    acc[r.emoji].users.push(r.user?.username);
    return acc;
  }, {});

  return (
    <Group gap={3} mt={3}>
      {Object.values(grouped).map((r) => (
        <ReactionPill
          key={r.emoji}
          emoji={r.emoji}
          count={r.count}
          users={r.users}
          onClick={() => onReact(messageId, r.emoji)}
        />
      ))}
    </Group>
  );
};

// Thread drawer component
const ThreadDrawer = ({ open, onClose, parentMessage, channelId }) => {
  const { data: threadData, isLoading } = useThreadMessages(parentMessage?.id);
  const replies = threadData?.replies || [];

  return (
    <Drawer
      title={
        <Group gap={6}>
          <IconMessage size={16} />
          <span style={{ fontSize: 13 }}>Thread ({replies.length} balasan)</span>
        </Group>
      }
      open={open}
      onClose={onClose}
      width={400}
      placement="right"
    >
      {/* Original message */}
      {parentMessage && (
        <Paper withBorder p="xs" mb="md" radius="sm" style={{ backgroundColor: "#fafafa" }}>
          <Group gap={6} mb={4}>
            <Avatar src={parentMessage.user?.image} size={24} radius="sm">
              {parentMessage.user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Text size="xs" fw={600}>{parentMessage.user?.username}</Text>
            <Text size={10} c="dimmed">{dayjs(parentMessage.created_at).format("DD/MM HH:mm")}</Text>
          </Group>
          <MessageContent content={parentMessage.content} mentions={parentMessage.mentions} />
        </Paper>
      )}

      {/* Replies */}
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : replies.length === 0 ? (
        <Empty description="Belum ada balasan" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Stack gap={8}>
          {replies.map((reply) => (
            <Box key={reply.id} pl={8} style={{ borderLeft: "2px solid #1264a3" }}>
              <Group gap={6} mb={2}>
                <Avatar src={reply.user?.image} size={20} radius="sm">
                  {reply.user?.username?.[0]?.toUpperCase()}
                </Avatar>
                <Text size={11} fw={600}>{reply.user?.username}</Text>
                <Text size={10} c="dimmed">{dayjs(reply.created_at).format("HH:mm")}</Text>
              </Group>
              <MessageContent content={reply.content} mentions={reply.mentions} />
            </Box>
          ))}
        </Stack>
      )}
    </Drawer>
  );
};

// Single message item
const MessageItem = ({ message, channelId, onEdit, onDelete, onReply, onViewThread }) => {
  const [hovered, setHovered] = useState(false);
  const toggleReaction = useToggleReaction();
  const togglePin = useTogglePinMessage();

  const handleReact = (emoji) => {
    toggleReaction.mutate({ messageId: message.id, emoji });
  };

  const handlePin = () => {
    togglePin.mutate({ channelId, messageId: message.id });
  };

  const menuItems = [
    { key: "reply", icon: <IconMessageReply size={12} />, label: "Balas" },
    {
      key: "pin",
      icon: <IconPin size={12} />,
      label: message.is_pinned ? "Unpin pesan" : "Pin pesan",
    },
    { type: "divider" },
    {
      key: "edit",
      icon: <IconEdit size={12} />,
      label: "Edit",
      disabled: !message.is_own,
    },
    {
      key: "delete",
      icon: <IconTrash size={12} />,
      label: "Hapus",
      danger: true,
      disabled: !message.is_own,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "pin") handlePin();
    if (key === "edit") onEdit?.(message);
    if (key === "delete") onDelete?.(message.id);
    if (key === "reply") onReply?.(message);
  };

  const reactionContent = (
    <Group gap={2} p={2}>
      {COMMON_REACTIONS.map((emoji) => (
        <ActionIcon
          key={emoji}
          variant="subtle"
          size="sm"
          onClick={() => handleReact(emoji)}
          style={{ fontSize: 14 }}
        >
          {emoji}
        </ActionIcon>
      ))}
    </Group>
  );

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      px="sm"
      py={3}
      style={{
        position: "relative",
        backgroundColor: hovered ? "#f8f8f8" : "transparent",
        transition: "background-color 0.1s",
      }}
    >
      <Group align="flex-start" gap={8} wrap="nowrap">
        <Avatar src={message.user?.image} size={28} radius="sm">
          {message.user?.username?.[0]?.toUpperCase()}
        </Avatar>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap={6} mb={1}>
            <Text size="xs" fw={700} style={{ color: "#1d1c1d" }}>
              {message.user?.username || "Unknown"}
            </Text>
            <Text size={10} c="dimmed">
              {dayjs(message.created_at).format("HH:mm")}
            </Text>
            {message.is_edited && (
              <Text size={10} c="dimmed">(diedit)</Text>
            )}
            {message.is_pinned && (
              <Group gap={2}>
                <IconPin size={10} color="#e8912d" />
                <Text size={10} c="orange">pinned</Text>
              </Group>
            )}
          </Group>

          {/* Show parent message if this is a reply */}
          {message.parent && (
            <Box
              mb={3}
              pl={6}
              py={2}
              style={{
                borderLeft: "2px solid #1264a3",
                backgroundColor: "#f0f7ff",
                borderRadius: "0 4px 4px 0",
                cursor: "pointer",
              }}
              onClick={() => onViewThread?.(message.parent)}
            >
              <Text size={10} c="dimmed">
                Membalas{" "}
                <Text span fw={600} c="blue" size={10}>
                  {message.parent.user?.username}
                </Text>
              </Text>
              <Text size={10} c="dimmed" lineClamp={1}>
                {message.parent.content?.slice(0, 50)}...
              </Text>
            </Box>
          )}

          <MessageContent content={message.content} mentions={message.mentions} />

          {message.attachments?.map((att) => (
            <AttachmentPreview key={att.id} attachment={att} />
          ))}

          {/* Link to Kanban Task */}
          {message.linked_task && (
            <Paper
              withBorder
              p={6}
              mt={4}
              radius="sm"
              style={{ backgroundColor: "#f0fdf4", borderColor: "#86efac" }}
            >
              <Group gap={6}>
                <IconSubtask size={14} color="#16a34a" />
                <Box>
                  <Text size={10} c="dimmed">Terkait dengan task Kanban:</Text>
                  <a
                    href={`/kanban?task=${message.linked_task.id}`}
                    style={{ color: "#16a34a", fontWeight: 600, fontSize: 12, textDecoration: "none" }}
                  >
                    {message.linked_task.title}
                  </a>
                </Box>
              </Group>
            </Paper>
          )}

          {/* Link to Email */}
          {message.linked_email && (
            <Paper
              withBorder
              p={6}
              mt={4}
              radius="sm"
              style={{ backgroundColor: "#fef3c7", borderColor: "#fcd34d" }}
            >
              <Group gap={6}>
                <IconMail size={14} color="#d97706" />
                <Box>
                  <Text size={10} c="dimmed">Terkait dengan email:</Text>
                  <a
                    href={`/mails?email=${message.linked_email.id}`}
                    style={{ color: "#d97706", fontWeight: 600, fontSize: 12, textDecoration: "none" }}
                  >
                    {message.linked_email.subject}
                  </a>
                </Box>
              </Group>
            </Paper>
          )}

          <MessageReactions
            reactions={message.reactions}
            messageId={message.id}
            onReact={handleReact}
          />

          {/* Thread count - clickable */}
          {message.thread_count > 0 && (
            <Box
              mt={4}
              p={4}
              onClick={() => onViewThread?.(message)}
              style={{
                cursor: "pointer",
                backgroundColor: "#f0f7ff",
                borderRadius: 4,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <IconMessage size={12} color="#1264a3" />
              <Text size={10} c="blue" fw={600}>
                {message.thread_count} balasan - Klik untuk lihat
              </Text>
            </Box>
          )}
        </Box>

        {/* Hover actions */}
        <Group
          gap={1}
          style={{
            position: "absolute",
            top: 2,
            right: 8,
            opacity: hovered ? 1 : 0,
            backgroundColor: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 4,
            padding: "1px 2px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            transition: "opacity 0.15s",
          }}
        >
          <Popover content={reactionContent} trigger="click" placement="top">
            <ActionIcon variant="subtle" size="xs" color="gray">
              <IconMoodSmile size={14} />
            </ActionIcon>
          </Popover>
          <Dropdown
            menu={{ items: menuItems, onClick: handleMenuClick }}
            trigger={["click"]}
          >
            <ActionIcon variant="subtle" size="xs" color="gray">
              <IconDotsVertical size={14} />
            </ActionIcon>
          </Dropdown>
        </Group>
      </Group>
    </Box>
  );
};

const MessageList = ({ channelId, onEdit, onDelete, onReply }) => {
  const containerRef = useRef(null);
  const { data, isLoading } = useMessages(channelId, { page: 1, limit: 100 });
  const prevLengthRef = useRef(0);
  
  const [threadMessage, setThreadMessage] = useState(null);

  const messages = data?.results || [];

  useEffect(() => {
    if (messages.length > prevLengthRef.current) {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: prevLengthRef.current === 0 ? "auto" : "smooth",
      });
    }
    prevLengthRef.current = messages.length;
  }, [messages.length]);

  if (isLoading) return <Skeleton active paragraph={{ rows: 6 }} style={{ padding: 12 }} />;

  if (!messages.length) {
    return (
      <Box ta="center" py={40}>
        <Text c="dimmed" size="xs">Belum ada pesan di channel ini</Text>
        <Text size={10} c="dimmed" mt={2}>Mulai percakapan dengan mengirim pesan pertama</Text>
      </Box>
    );
  }

  return (
    <>
      <Box
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Stack gap={0} py="xs">
          {[...messages].reverse().map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              channelId={channelId}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              onViewThread={setThreadMessage}
            />
          ))}
        </Stack>
      </Box>

      {/* Thread Drawer */}
      <ThreadDrawer
        open={!!threadMessage}
        onClose={() => setThreadMessage(null)}
        parentMessage={threadMessage}
        channelId={channelId}
      />
    </>
  );
};

export default MessageList;

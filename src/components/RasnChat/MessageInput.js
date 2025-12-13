import { useSendMessage, useEditMessage } from "@/hooks/useRasnChat";
import { Button, message, Upload, Input, Tooltip, Avatar } from "antd";
import { Group, Box, Paper, Text, ActionIcon } from "@mantine/core";
import {
  IconSend,
  IconPaperclip,
  IconX,
  IconMoodSmile,
  IconAt,
  IconBold,
  IconItalic,
  IconList,
  IconCode,
  IconLink,
  IconQuote,
} from "@tabler/icons-react";
import { useState, useEffect, useRef, useCallback } from "react";
import EmojiPicker from "./EmojiPicker";
import { formatFileSize, searchUsers } from "@/services/rasn-chat.services";

const { TextArea } = Input;

const MessageInput = ({
  channelId,
  replyTo,
  editMessage,
  onCancelReply,
  onCancelEdit,
}) => {
  const [content, setContent] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const cursorPosRef = useRef(0);

  // Mention state
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionUsers, setMentionUsers] = useState([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  // Store selected mentions with their user IDs for sending to API
  const [selectedMentions, setSelectedMentions] = useState([]);

  const sendMsg = useSendMessage();
  const editMsg = useEditMessage();

  useEffect(() => {
    if (editMessage) {
      setContent(editMessage.content || "");
    }
  }, [editMessage]);

  // Search users for mention
  useEffect(() => {
    if (!showMentionDropdown) return;

    const searchMention = async () => {
      setIsSearching(true);
      try {
        const res = await searchUsers(mentionQuery || "");
        setMentionUsers(res?.slice(0, 10) || []);
      } catch (e) {
        console.error("Search error:", e);
        setMentionUsers([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchMention, 200);
    return () => clearTimeout(timer);
  }, [mentionQuery, showMentionDropdown]);

  const getTextarea = useCallback(() => {
    return textareaRef.current?.resizableTextArea?.textArea;
  }, []);

  const insertMarkdown = (prefix, suffix = prefix) => {
    const textarea = getTextarea();
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);

    if (selectedText) {
      const newText = `${before}${prefix}${selectedText}${suffix}${after}`;
      setContent(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 0);
    } else {
      const newText = `${before}${prefix}${suffix}${after}`;
      setContent(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length
        );
      }, 0);
    }
  };

  const insertList = () => {
    const textarea = getTextarea();
    if (!textarea) return;

    const start = textarea.selectionStart;
    const before = content.substring(0, start);
    const after = content.substring(start);
    const needsNewline = before.length > 0 && !before.endsWith("\n");

    const listItem = `${needsNewline ? "\n" : ""}- `;
    const newText = `${before}${listItem}${after}`;
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + listItem.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const insertLink = () => insertMarkdown("[", "](url)");

  const insertQuote = () => {
    const textarea = getTextarea();
    if (!textarea) return;

    const start = textarea.selectionStart;
    const before = content.substring(0, start);
    const after = content.substring(start);
    const needsNewline = before.length > 0 && !before.endsWith("\n");

    const quote = `${needsNewline ? "\n" : ""}> `;
    const newText = `${before}${quote}${after}`;
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + quote.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Check for mention - ALLOW SPACES in query
  const checkForMention = useCallback((text, cursorPos) => {
    const textBeforeCursor = text.substring(0, cursorPos);

    let lastAtIndex = -1;
    for (let i = textBeforeCursor.length - 1; i >= 0; i--) {
      if (textBeforeCursor[i] === "@") {
        const charBefore = i > 0 ? textBeforeCursor[i - 1] : " ";
        if (/[\s\n]/.test(charBefore) || i === 0) {
          lastAtIndex = i;
          break;
        }
      }
    }

    if (lastAtIndex === -1) {
      return { show: false, query: "" };
    }

    const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

    // Close dropdown if double space
    if (textAfterAt.endsWith("  ")) {
      return { show: false, query: "" };
    }

    return { show: true, query: textAfterAt };
  }, []);

  const handleContentChange = (e) => {
    const newValue = e.target.value;
    setContent(newValue);

    const textarea = getTextarea();
    const cursorPos = textarea?.selectionStart || newValue.length;
    cursorPosRef.current = cursorPos;

    const { show, query } = checkForMention(newValue, cursorPos);

    if (show) {
      setMentionQuery(query);
      setShowMentionDropdown(true);
      setMentionIndex(0);
    } else {
      setShowMentionDropdown(false);
      setMentionQuery("");
    }
  };

  const insertMention = (user) => {
    const textarea = getTextarea();
    const cursorPos = cursorPosRef.current || content.length;
    const textBeforeCursor = content.substring(0, cursorPos);
    const textAfterCursor = content.substring(cursorPos);

    let lastAtIndex = -1;
    for (let i = textBeforeCursor.length - 1; i >= 0; i--) {
      if (textBeforeCursor[i] === "@") {
        const charBefore = i > 0 ? textBeforeCursor[i - 1] : " ";
        if (/[\s\n]/.test(charBefore) || i === 0) {
          lastAtIndex = i;
          break;
        }
      }
    }
    if (lastAtIndex === -1) return;

    const beforeMention = content.substring(0, lastAtIndex);
    // Use full username for display (nama lengkap biru)
    const displayName = user.username || "";
    const newText = `${beforeMention}@${displayName} ${textAfterCursor}`;

    setContent(newText);

    // Store the mention with user ID for sending to API
    setSelectedMentions((prev) => {
      // Avoid duplicates
      if (prev.find((m) => m.userId === user.custom_id)) return prev;
      return [
        ...prev,
        { userId: user.custom_id, username: displayName, type: "user" },
      ];
    });

    setShowMentionDropdown(false);
    setMentionQuery("");

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newPos = lastAtIndex + displayName.length + 2;
        textarea.setSelectionRange(newPos, newPos);
        cursorPosRef.current = newPos;
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (showMentionDropdown && mentionUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((prev) => (prev + 1) % mentionUsers.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex(
          (prev) => (prev - 1 + mentionUsers.length) % mentionUsers.length
        );
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(mentionUsers[mentionIndex]);
      } else if (e.key === "Escape") {
        setShowMentionDropdown(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Extract mentions from content text
  const extractMentionsFromContent = (text) => {
    const mentionRegex = /@([^\s@]+(?:\s[^\s@]+)*?)(?=\s|$)/g;
    const foundMentions = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1];
      // Find the user ID from selectedMentions
      const stored = selectedMentions.find(
        (m) => m.username.toLowerCase() === username.toLowerCase()
      );
      if (stored) {
        foundMentions.push({ userId: stored.userId, type: "user" });
      }
    }

    return foundMentions;
  };

  const handleSend = async () => {
    if (!content.trim() && pendingFiles.length === 0) return;

    setUploading(true);
    try {
      if (editMessage) {
        await editMsg.mutateAsync({
          messageId: editMessage.id,
          content: content.trim(),
        });
        onCancelEdit?.();
      } else {
        // Extract mentions from content
        const mentions = extractMentionsFromContent(content);

        await sendMsg.mutateAsync({
          channelId,
          content: content.trim(),
          parentId: replyTo?.id,
          mentions, // Send mentions array to API
          files: pendingFiles.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
            dataUrl: f.dataUrl,
          })),
        });
        onCancelReply?.();
      }
      setContent("");
      setPendingFiles([]);
      setSelectedMentions([]); // Clear selected mentions after send
    } catch (error) {
      message.error(
        editMessage ? "Gagal mengedit pesan" : "Gagal mengirim pesan"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    const textarea = getTextarea();
    if (textarea) {
      const start = textarea.selectionStart;
      const before = content.substring(0, start);
      const after = content.substring(start);
      setContent(`${before}${emoji}${after}`);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setContent((prev) => prev + emoji);
    }
  };

  const handleFileSelect = async (file) => {
    if (file.size > 10 * 1024 * 1024) {
      message.error("File terlalu besar. Maksimal 10MB");
      return Upload.LIST_IGNORE;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPendingFiles((prev) => [
        ...prev,
        {
          uid: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: e.target.result,
        },
      ]);
    };
    reader.readAsDataURL(file);

    return Upload.LIST_IGNORE;
  };

  const removePendingFile = (uid) => {
    setPendingFiles((prev) => prev.filter((f) => f.uid !== uid));
  };

  const triggerMention = () => {
    const textarea = getTextarea();
    if (textarea) {
      const start = textarea.selectionStart;
      const before = content.substring(0, start);
      const after = content.substring(start);
      const newContent = `${before}@${after}`;
      setContent(newContent);
      cursorPosRef.current = start + 1;
      setShowMentionDropdown(true);
      setMentionQuery("");
      setMentionIndex(0);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 1, start + 1);
      }, 0);
    }
  };

  const isLoading = sendMsg.isLoading || editMsg.isLoading || uploading;

  return (
    <Box>
      {/* Reply indicator */}
      {replyTo && (
        <Paper
          p={6}
          mb={6}
          radius={0}
          style={{
            borderLeft: "3px solid #1264a3",
            backgroundColor: "#f8f8f8",
          }}
        >
          <Group justify="space-between">
            <Box>
              <Text size="xs" c="dimmed">
                Membalas{" "}
                <Text span fw={600}>
                  {replyTo.user?.username}
                </Text>
              </Text>
              <Text size="xs" lineClamp={1} c="dimmed">
                {replyTo.content}
              </Text>
            </Box>
            <ActionIcon size="sm" variant="subtle" onClick={onCancelReply}>
              <IconX size={12} />
            </ActionIcon>
          </Group>
        </Paper>
      )}

      {/* Edit indicator */}
      {editMessage && (
        <Paper
          p={6}
          mb={6}
          radius={0}
          style={{
            borderLeft: "3px solid #e8912d",
            backgroundColor: "#fff8f0",
          }}
        >
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Mengedit pesan
            </Text>
            <ActionIcon size="sm" variant="subtle" onClick={onCancelEdit}>
              <IconX size={12} />
            </ActionIcon>
          </Group>
        </Paper>
      )}

      {/* Pending files preview */}
      {pendingFiles.length > 0 && (
        <Group gap={6} mb={6} wrap="wrap">
          {pendingFiles.map((file) => (
            <Paper
              key={file.uid}
              withBorder
              p={6}
              radius="sm"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#f9f9f9",
              }}
            >
              <Text size="xs" truncate style={{ maxWidth: 120 }}>
                {file.name}
              </Text>
              <Text size="xs" c="dimmed">
                ({formatFileSize(file.size)})
              </Text>
              <ActionIcon
                size="xs"
                variant="subtle"
                onClick={() => removePendingFile(file.uid)}
              >
                <IconX size={10} />
              </ActionIcon>
            </Paper>
          ))}
        </Group>
      )}

      {/* Input container */}
      <Paper
        withBorder
        radius="md"
        style={{ overflow: "visible", position: "relative" }}
      >
        {/* Mention Dropdown */}
        {showMentionDropdown && (
          <Paper
            withBorder
            shadow="lg"
            radius="sm"
            style={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              right: 0,
              marginBottom: 4,
              maxHeight: 280,
              overflowY: "auto",
              zIndex: 1000,
              backgroundColor: "#fff",
            }}
          >
            <Box px={8} py={6} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <Text size="xs" c="dimmed">
                {isSearching
                  ? "Mencari..."
                  : mentionUsers.length > 0
                  ? `Pilih user (${mentionUsers.length} ditemukan)`
                  : "Tidak ada user ditemukan"}
              </Text>
            </Box>
            {mentionUsers.map((user, idx) => (
              <Box
                key={user.custom_id}
                onClick={() => insertMention(user)}
                px={10}
                py={8}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  backgroundColor:
                    idx === mentionIndex ? "#e6f4ff" : "transparent",
                }}
                onMouseEnter={() => setMentionIndex(idx)}
              >
                <Avatar src={user.image} size={32}>
                  {user.username?.[0]?.toUpperCase() || "?"}
                </Avatar>
                <Box>
                  <Text size="sm" fw={600}>
                    {user.username}
                  </Text>
                  {user.info?.nama && (
                    <Text size="xs" c="dimmed">
                      {user.info.nama}
                    </Text>
                  )}
                  {user.info?.nip && (
                    <Text size={10} c="dimmed">
                      NIP: {user.info.nip}
                    </Text>
                  )}
                </Box>
              </Box>
            ))}
          </Paper>
        )}

        {/* Markdown Toolbar */}
        <Group
          gap={4}
          px={8}
          py={4}
          style={{
            borderBottom: "1px solid #f0f0f0",
            backgroundColor: "#fafafa",
          }}
        >
          <Tooltip title="Tebal">
            <ActionIcon
              variant="subtle"
              size="sm"
              color="gray"
              onClick={() => insertMarkdown("**")}
            >
              <IconBold size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip title="Miring">
            <ActionIcon
              variant="subtle"
              size="sm"
              color="gray"
              onClick={() => insertMarkdown("*")}
            >
              <IconItalic size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip title="Code">
            <ActionIcon
              variant="subtle"
              size="sm"
              color="gray"
              onClick={() => insertMarkdown("`")}
            >
              <IconCode size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip title="List">
            <ActionIcon
              variant="subtle"
              size="sm"
              color="gray"
              onClick={insertList}
            >
              <IconList size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip title="Link">
            <ActionIcon
              variant="subtle"
              size="sm"
              color="gray"
              onClick={insertLink}
            >
              <IconLink size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip title="Quote">
            <ActionIcon
              variant="subtle"
              size="sm"
              color="gray"
              onClick={insertQuote}
            >
              <IconQuote size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* Text input */}
        <TextArea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder={
            editMessage ? "Edit pesan..." : "Tulis pesan... (@ untuk mention)"
          }
          autoSize={{ minRows: 2, maxRows: 8 }}
          bordered={false}
          style={{ resize: "none", padding: "10px 12px", fontSize: 14 }}
          disabled={isLoading}
        />

        {/* Bottom Toolbar */}
        <Group
          justify="space-between"
          px={8}
          py={6}
          style={{ borderTop: "1px solid #f0f0f0" }}
        >
          <Group gap={4}>
            <Upload
              beforeUpload={handleFileSelect}
              showUploadList={false}
              multiple
              disabled={uploading}
            >
              <ActionIcon
                variant="subtle"
                size="sm"
                color="gray"
                loading={uploading}
                title="Upload File"
              >
                <IconPaperclip size={16} />
              </ActionIcon>
            </Upload>

            <EmojiPicker onSelect={handleEmojiSelect}>
              <ActionIcon variant="subtle" size="sm" color="gray" title="Emoji">
                <IconMoodSmile size={16} />
              </ActionIcon>
            </EmojiPicker>

            <ActionIcon
              variant="subtle"
              size="sm"
              color="gray"
              title="Mention (@)"
              onClick={triggerMention}
            >
              <IconAt size={16} />
            </ActionIcon>
          </Group>

          <Button
            type="primary"
            size="small"
            icon={<IconSend size={14} />}
            onClick={handleSend}
            loading={isLoading}
            disabled={!content.trim() && pendingFiles.length === 0}
          >
            Kirim
          </Button>
        </Group>
      </Paper>
    </Box>
  );
};

export default MessageInput;

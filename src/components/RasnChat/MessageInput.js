import {
  useChannel,
  useEditMessage,
  useSendMessage,
} from "@/hooks/useRasnChat";
import { searchUsers } from "@/services/rasn-chat.services";
import { Box, Group, Paper, Text } from "@mantine/core";
import {
  IconAt,
  IconBold,
  IconCode,
  IconItalic,
  IconLink,
  IconList,
  IconMoodSmile,
  IconPaperclip,
  IconQuote,
  IconSend,
  IconStrikethrough,
  IconTypography,
  IconX,
} from "@tabler/icons-react";
import { Avatar, Button, Input, message, Tooltip, Upload } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import EmojiPicker from "./EmojiPicker";

const { TextArea } = Input;

const splitPerangkatDaerah = (perangkatDaerah) => {
  const parts = perangkatDaerah?.split("-");
  const firstPart = parts?.length > 0 ? parts[0] : "";
  const secondPart = parts?.length > 1 ? parts[1] : "";
  return `${firstPart} - ${secondPart}`;
};

// Toolbar button component using Ant Design Button
const ToolbarButton = ({
  icon: Icon,
  tooltip,
  onClick,
  active,
  disabled,
  size = 18,
}) => (
  <Tooltip title={tooltip}>
    <Button
      type={active ? "primary" : "text"}
      size="small"
      icon={<Icon size={size} stroke={1.5} />}
      onClick={onClick}
      disabled={disabled}
    />
  </Tooltip>
);


const MessageInput = ({
  channelId,
  replyTo,
  editMessage,
  onCancelReply,
  onCancelEdit,
  channelName,
}) => {
  const [content, setContent] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false); // Hidden by default for compact view
  const textareaRef = useRef(null);
  const cursorPosRef = useRef(0);

  // Get channel name if not provided
  const { data: channel } = useChannel(channelId);
  const displayChannelName = channelName || channel?.name || "channel";

  // Mention state
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionUsers, setMentionUsers] = useState([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMentions, setSelectedMentions] = useState([]);
  const justInsertedMentionRef = useRef(false);

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

  const focusTextarea = useCallback(() => {
    const textarea = getTextarea();
    if (textarea) {
      textarea.focus();
    }
  }, [getTextarea]);

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

  const insertList = (ordered = false) => {
    const textarea = getTextarea();
    if (!textarea) return;

    const start = textarea.selectionStart;
    const before = content.substring(0, start);
    const after = content.substring(start);
    const needsNewline = before.length > 0 && !before.endsWith("\n");

    const listItem = `${needsNewline ? "\n" : ""}${ordered ? "1. " : "- "}`;
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

  const insertCodeBlock = () => {
    const textarea = getTextarea();
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);

    const codeBlock = selectedText
      ? `\`\`\`\n${selectedText}\n\`\`\``
      : "```\n\n```";
    const newText = `${before}${codeBlock}${after}`;
    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = selectedText ? start + codeBlock.length : start + 4;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Check for mention
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

    // Skip mention check if we just inserted a mention
    if (justInsertedMentionRef.current) {
      justInsertedMentionRef.current = false;
      return;
    }

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
    const displayName = user.username || "";
    const newText = `${beforeMention}@${displayName} ${textAfterCursor}`;

    // Set flag to skip next mention check
    justInsertedMentionRef.current = true;

    setContent(newText);

    setSelectedMentions((prev) => {
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

  const extractMentionsFromContent = (text) => {
    const foundMentions = [];
    const textLower = text.toLowerCase();

    for (const mention of selectedMentions) {
      const mentionPattern = `@${mention.username.toLowerCase()}`;
      if (textLower.includes(mentionPattern)) {
        if (!foundMentions.find((m) => m.userId === mention.userId)) {
          foundMentions.push({
            userId: mention.userId,
            type: mention.type || "user",
          });
        }
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
        const mentions = extractMentionsFromContent(content);

        await sendMsg.mutateAsync({
          channelId,
          content: content.trim(),
          parentId: replyTo?.id,
          mentions,
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
      setSelectedMentions([]);

      // Keep focus on textarea after sending
      setTimeout(focusTextarea, 50);
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

  const isLoading = sendMsg.isPending || editMsg.isPending || uploading;
  const canSend = content.trim() || pendingFiles.length > 0;

  return (
    <Box>
      {/* Reply indicator - compact */}
      {replyTo && (
        <Group
          gap={8}
          mb={4}
          px={8}
          py={4}
          style={{
            borderLeft: "2px solid #1264a3",
            backgroundColor: "#f0f7ff",
            borderRadius: 4,
          }}
        >
          <Text size="xs" c="dimmed" style={{ flex: 1 }}>
            Membalas <Text span fw={600} c="blue">{replyTo.user?.username}</Text>
          </Text>
          <Button
            type="text"
            size="small"
            icon={<IconX size={12} />}
            onClick={onCancelReply}
            style={{ padding: 2, height: "auto", minWidth: "auto" }}
          />
        </Group>
      )}

      {/* Edit indicator - compact */}
      {editMessage && (
        <Group
          gap={8}
          mb={4}
          px={8}
          py={4}
          style={{
            borderLeft: "2px solid #faad14",
            backgroundColor: "#fffbe6",
            borderRadius: 4,
          }}
        >
          <Text size="xs" c="orange" fw={500} style={{ flex: 1 }}>
            Mengedit pesan
          </Text>
          <Button
            type="text"
            size="small"
            icon={<IconX size={12} />}
            onClick={onCancelEdit}
            style={{ padding: 2, height: "auto", minWidth: "auto" }}
          />
        </Group>
      )}

      {/* Pending files preview - compact */}
      {pendingFiles.length > 0 && (
        <Group gap={4} mb={4} wrap="wrap">
          {pendingFiles.map((file) => (
            <Group
              key={file.uid}
              gap={4}
              px={6}
              py={2}
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: 4,
                fontSize: 11,
              }}
            >
              <IconPaperclip size={12} color="#666" />
              <Text size="xs" truncate style={{ maxWidth: 100 }}>
                {file.name}
              </Text>
              <Button
                type="text"
                size="small"
                danger
                icon={<IconX size={10} />}
                onClick={() => removePendingFile(file.uid)}
                style={{ padding: 0, height: "auto", minWidth: "auto" }}
              />
            </Group>
          ))}
        </Group>
      )}

      {/* Main Input Container */}
      <Paper
        withBorder
        radius="md"
        style={{
          overflow: "visible",
          position: "relative",
          border: "1px solid #d9d9d9",
        }}
      >
        {/* Mention Dropdown */}
        {showMentionDropdown && (
          <Paper
            withBorder
            shadow="lg"
            radius="md"
            style={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              right: 0,
              marginBottom: 8,
              maxHeight: 300,
              overflowY: "auto",
              zIndex: 1000,
              backgroundColor: "#fff",
            }}
          >
            <Box px={12} py={8} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <Text size="xs" c="dimmed" fw={500}>
                {isSearching
                  ? "Mencari..."
                  : mentionUsers.length > 0
                  ? `${mentionUsers.length} user ditemukan`
                  : "Tidak ada user ditemukan"}
              </Text>
            </Box>
            {mentionUsers.map((user, idx) => (
              <Box
                key={user.custom_id}
                onClick={() => insertMention(user)}
                px={12}
                py={10}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  backgroundColor:
                    idx === mentionIndex ? "#e6f4ff" : "transparent",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={() => setMentionIndex(idx)}
              >
                <Avatar src={user.image} size={36} radius="sm">
                  {user.username?.[0]?.toUpperCase() || "?"}
                </Avatar>
                <Box>
                  <Text size="sm" fw={600}>
                    {user.username}
                  </Text>
                  {user.perangkat_daerah && (
                    <Text size="10px" c="dimmed" lineClamp={1} fs="italic">
                      {splitPerangkatDaerah(user.perangkat_daerah)}
                    </Text>
                  )}
                </Box>
              </Box>
            ))}
          </Paper>
        )}

        {/* Formatting Toolbar - Compact */}
        {showFormatting && (
          <Group
            gap={0}
            px={8}
            py={4}
            wrap="wrap"
            style={{
              borderBottom: "1px solid #f0f0f0",
              backgroundColor: "#fafafa",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          >
            <ToolbarButton
              icon={IconBold}
              tooltip="Tebal"
              onClick={() => insertMarkdown("**")}
              size={14}
            />
            <ToolbarButton
              icon={IconItalic}
              tooltip="Miring"
              onClick={() => insertMarkdown("*")}
              size={14}
            />
            <ToolbarButton
              icon={IconStrikethrough}
              tooltip="Coret"
              onClick={() => insertMarkdown("~~")}
              size={14}
            />
            <ToolbarButton
              icon={IconLink}
              tooltip="Link"
              onClick={insertLink}
              size={14}
            />
            <ToolbarButton
              icon={IconCode}
              tooltip="Kode"
              onClick={() => insertMarkdown("`")}
              size={14}
            />
            <ToolbarButton
              icon={IconList}
              tooltip="Daftar"
              onClick={() => insertList(false)}
              size={14}
            />
            <ToolbarButton
              icon={IconQuote}
              tooltip="Kutipan"
              onClick={insertQuote}
              size={14}
            />
          </Group>
        )}

        {/* Text Input */}
        <TextArea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder={
            editMessage ? "Edit pesan..." : `Tulis pesan...`
          }
          autoSize={{ minRows: 1, maxRows: 6 }}
          variant="borderless"
          style={{
            resize: "none",
            padding: "8px 12px",
            fontSize: 14,
            lineHeight: 1.4,
          }}
          disabled={isLoading}
        />

        {/* Bottom Toolbar - Compact */}
        <Group
          justify="space-between"
          px={8}
          py={4}
          style={{
            borderTop: "1px solid #f0f0f0",
            backgroundColor: "#fafafa",
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          {/* Left side tools */}
          <Group gap={0}>
            <Upload
              beforeUpload={handleFileSelect}
              showUploadList={false}
              multiple
              disabled={uploading}
            >
              <ToolbarButton
                icon={IconPaperclip}
                tooltip="Tambah File"
                disabled={uploading}
                size={16}
              />
            </Upload>

            <EmojiPicker onSelect={handleEmojiSelect}>
              <ToolbarButton icon={IconMoodSmile} tooltip="Emoji" size={16} />
            </EmojiPicker>

            <ToolbarButton
              icon={IconAt}
              tooltip="Mention (@)"
              onClick={triggerMention}
              size={16}
            />

            <ToolbarButton
              icon={IconTypography}
              tooltip={
                showFormatting ? "Sembunyikan Format" : "Tampilkan Format"
              }
              onClick={() => setShowFormatting(!showFormatting)}
              active={showFormatting}
              size={16}
            />
          </Group>

          {/* Right side - Send button */}
          <Tooltip
            title={canSend ? "Kirim (Enter)" : "Tulis pesan"}
          >
            <Button
              type={canSend ? "primary" : "text"}
              size="small"
              onClick={handleSend}
              loading={isLoading}
              disabled={!canSend}
              icon={<IconSend size={16} />}
            />
          </Tooltip>
        </Group>
      </Paper>
    </Box>
  );
};

export default MessageInput;

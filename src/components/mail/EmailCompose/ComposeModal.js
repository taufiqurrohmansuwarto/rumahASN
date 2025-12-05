import {
  useRefineText,
  useReplyToEmail,
  useSaveDraft,
  useSendEmail,
} from "@/hooks/useEmails";
import { extractAttachmentIds } from "@/utils/debugUpload";
import { Box, Group, Stack, Text, Transition } from "@mantine/core";
import {
  IconBold,
  IconEye,
  IconItalic,
  IconList,
  IconMail,
  IconMailForward,
  IconMailReply,
  IconNote,
  IconPencil,
  IconSparkles,
  IconWand,
} from "@tabler/icons-react";
import {
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  Tooltip,
  message,
} from "antd";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState, useCallback } from "react";
import AttachmentUploader from "./AttachmentUploader";

// Dynamic import untuk markdown preview (SSR safe)
const ReactMarkdownCustom = dynamic(
  () => import("@/components/MarkdownEditor/ReactMarkdownCustom"),
  {
    ssr: false,
    loading: () => (
      <Text size="sm" c="dimmed">
        Loading preview...
      </Text>
    ),
  }
);

// AI Refine Button Component dengan animasi
const AIRefineButton = ({ value, onChange, disabled, onLoadingChange }) => {
  const refineText = useRefineText();
  const [isAnimating, setIsAnimating] = useState(false);

  const aiModes = [
    {
      key: "professional",
      label: "Profesional",
      icon: "👔",
      description: "Formal & sopan",
    },
    {
      key: "friendly",
      label: "Ramah",
      icon: "😊",
      description: "Hangat & bersahabat",
    },
    {
      key: "concise",
      label: "Ringkas",
      icon: "⚡",
      description: "Singkat & padat",
    },
    {
      key: "detailed",
      label: "Detail",
      icon: "📝",
      description: "Lengkap & jelas",
    },
  ];

  const isLoading = refineText.isLoading || isAnimating;

  // Notify parent about loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  // Typing animation effect
  const animateTyping = useCallback(
    async (finalText) => {
      setIsAnimating(true);
      const words = finalText.split(" ");
      let currentText = "";

      for (let i = 0; i < words.length; i++) {
        currentText += (i > 0 ? " " : "") + words[i];
        onChange(currentText);
        // Variable delay for natural feel
        await new Promise((r) => setTimeout(r, 15 + Math.random() * 25));
      }

      setIsAnimating(false);
    },
    [onChange]
  );

  const handleRefine = async (mode) => {
    if (!value || value.trim().length === 0) {
      message.warning("Tulis pesan terlebih dahulu");
      return;
    }

    try {
      const result = await refineText.mutateAsync({
        text: value,
        mode,
      });

      if (result?.success && result?.data?.refined) {
        // Animate the text change
        await animateTyping(result.data.refined);
        message.success("Pesan berhasil diperhalus ✨");
      }
    } catch (error) {
      console.error("Refine error:", error);
    }
  };

  const menuItems = aiModes.map((mode) => ({
    key: mode.key,
    label: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>{mode.icon}</span>
        <div>
          <div style={{ fontWeight: 500, fontSize: 12 }}>{mode.label}</div>
          <div style={{ fontSize: 10, color: "#666" }}>{mode.description}</div>
        </div>
      </div>
    ),
    onClick: () => handleRefine(mode.key),
  }));

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["click"]}
      disabled={disabled || isLoading || !value}
      placement="bottomRight"
    >
      <Tooltip title={!value ? "Tulis pesan dulu" : "Perhalus dengan AI"}>
        <Button
          size="small"
          type="text"
          loading={isLoading}
          disabled={disabled || !value}
          style={{
            background: isLoading
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              : value
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : undefined,
            color: value ? "#fff" : undefined,
            border: "none",
            borderRadius: 6,
            padding: "2px 8px",
            height: 24,
            transition: "all 0.3s ease",
            boxShadow: value ? "0 2px 8px rgba(102, 126, 234, 0.3)" : undefined,
          }}
          icon={
            !isLoading && (
              <IconSparkles
                size={14}
                style={{
                  animation: isLoading ? "pulse 1.5s infinite" : undefined,
                }}
              />
            )
          }
        >
          {isLoading ? "Memproses..." : "AI"}
        </Button>
      </Tooltip>
    </Dropdown>
  );
};

// Simple Markdown Editor dengan toolbar dan preview
const SimpleMarkdownEditor = ({ value, onChange, placeholder, rows = 8 }) => {
  const textareaRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const isDisabled = showPreview || aiLoading;

  const getTextarea = () => {
    // Ant Design Input.TextArea wraps native textarea
    const el = textareaRef.current;
    if (!el) return null;
    // Access native textarea
    return el.resizableTextArea?.textArea || el;
  };

  const insertMarkdown = (prefix, suffix = "") => {
    const textarea = getTextarea();
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value || "";
    const selectedText = text.substring(start, end);

    let newText;
    let newCursorPos;

    if (selectedText) {
      newText =
        text.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        text.substring(end);
      newCursorPos =
        start + prefix.length + selectedText.length + suffix.length;
    } else {
      newText =
        text.substring(0, start) + prefix + suffix + text.substring(end);
      newCursorPos = start + prefix.length;
    }

    onChange(newText);

    setTimeout(() => {
      const ta = getTextarea();
      if (ta) {
        ta.focus();
        ta.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
  };

  const handleBold = () => insertMarkdown("**", "**");
  const handleItalic = () => insertMarkdown("*", "*");
  const handleList = () => {
    const textarea = getTextarea();
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = value || "";

    let lineStart = start;
    while (lineStart > 0 && text[lineStart - 1] !== "\n") {
      lineStart--;
    }

    const newText =
      text.substring(0, lineStart) + "- " + text.substring(lineStart);
    onChange(newText);

    setTimeout(() => {
      const ta = getTextarea();
      if (ta) {
        ta.focus();
        ta.setSelectionRange(lineStart + 2, lineStart + 2);
      }
    }, 10);
  };

  return (
    <div>
      <Group gap={4} mb={4} justify="space-between">
        <Group gap={4}>
          <Tooltip title="Tebal">
            <Button
              size="small"
              type="text"
              icon={<IconBold size={14} />}
              onClick={handleBold}
              disabled={isDisabled}
            />
          </Tooltip>
          <Tooltip title="Miring">
            <Button
              size="small"
              type="text"
              icon={<IconItalic size={14} />}
              onClick={handleItalic}
              disabled={isDisabled}
            />
          </Tooltip>
          <Tooltip title="List">
            <Button
              size="small"
              type="text"
              icon={<IconList size={14} />}
              onClick={handleList}
              disabled={isDisabled}
            />
          </Tooltip>
          <Text size="xs" c="dimmed" ml={4}>
            **tebal** *miring*
          </Text>
        </Group>
        <Group gap={4}>
          <AIRefineButton
            value={value}
            onChange={onChange}
            disabled={showPreview}
            onLoadingChange={setAiLoading}
          />
          <Button
            size="small"
            type={showPreview ? "primary" : "text"}
            icon={
              showPreview ? <IconPencil size={14} /> : <IconEye size={14} />
            }
            onClick={() => setShowPreview(!showPreview)}
            disabled={aiLoading}
          >
            {showPreview ? "Edit" : "Preview"}
          </Button>
        </Group>
      </Group>

      {showPreview ? (
        <Box
          p="sm"
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: 6,
            minHeight: rows * 22,
            maxHeight: rows * 22,
            overflow: "auto",
            backgroundColor: "#fafafa",
          }}
        >
          {value ? (
            <ReactMarkdownCustom>{value}</ReactMarkdownCustom>
          ) : (
            <Text size="sm" c="dimmed">
              Tidak ada konten
            </Text>
          )}
        </Box>
      ) : (
        <Input.TextArea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={aiLoading}
          style={{
            resize: "none",
            transition: "all 0.3s ease",
            backgroundColor: aiLoading ? "#f5f5f5" : undefined,
            cursor: aiLoading ? "not-allowed" : undefined,
          }}
          onKeyDown={(e) => {
            if (e.ctrlKey || e.metaKey) {
              if (e.key === "b") {
                e.preventDefault();
                handleBold();
              } else if (e.key === "i") {
                e.preventDefault();
                handleItalic();
              }
            }
          }}
        />
      )}
    </div>
  );
};

// Inline RecipientSelector to avoid import issues
const RecipientSelector = ({
  recipients,
  onChange,
  showCc,
  showBcc,
  onToggleCc,
  onToggleBcc,
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text) => {
    if (!text || text.length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/helpdesk/api/rasn-mail/search/users?q=${text}`);
      const data = await res.json();
      if (data.success) {
        setOptions(data.data.map((u) => ({ label: u.username, value: u.id })));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (type, val) => {
    onChange({ ...recipients, [type]: val || [] });
  };

  const selectProps = {
    mode: "multiple",
    labelInValue: true,
    onSearch: handleSearch,
    loading,
    showSearch: true,
    filterOption: false,
    notFoundContent: loading ? "Mencari..." : "Ketik 2+ karakter",
    style: { width: "100%" },
    size: "small",
    options,
  };

  return (
    <Stack gap={6}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <Text size="xs" fw={500} mb={2}>
            Kepada
          </Text>
          <Select
            {...selectProps}
            placeholder="Cari..."
            value={recipients.to}
            onChange={(val) => handleChange("to", val)}
          />
        </div>
        {!showCc && (
          <Text
            size="xs"
            c="blue"
            style={{ cursor: "pointer" }}
            onClick={onToggleCc}
          >
            +CC
          </Text>
        )}
        {!showBcc && (
          <Text
            size="xs"
            c="blue"
            style={{ cursor: "pointer" }}
            onClick={onToggleBcc}
          >
            +BCC
          </Text>
        )}
      </div>
      {showCc && (
        <div>
          <Text size="xs" fw={500} mb={2}>
            CC
          </Text>
          <Select
            {...selectProps}
            placeholder="CC..."
            value={recipients.cc}
            onChange={(val) => handleChange("cc", val)}
          />
        </div>
      )}
      {showBcc && (
        <div>
          <Text size="xs" fw={500} mb={2}>
            BCC
          </Text>
          <Select
            {...selectProps}
            placeholder="BCC..."
            value={recipients.bcc}
            onChange={(val) => handleChange("bcc", val)}
          />
        </div>
      )}
    </Stack>
  );
};

const ComposeModal = ({
  visible = false,
  onClose,
  onSent,
  mode = "compose",
  originalEmail = null,
  replyAll = false,
  title = "Tulis Email",
  initialRecipient = null, // { value: userId, label: username }
}) => {
  const [form] = Form.useForm();
  const [recipients, setRecipients] = useState({ to: [], cc: [], bcc: [] });
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [messageContent, setMessageContent] = useState("");

  const { data: sessionData } = useSession();
  const user = sessionData?.user;

  const sendEmail = useSendEmail();
  const saveDraft = useSaveDraft();
  const replyToEmail = useReplyToEmail();

  // Handle initialRecipient untuk japri dari profile
  useEffect(() => {
    if (mode === "compose" && initialRecipient && visible) {
      setRecipients({ to: [initialRecipient], cc: [], bcc: [] });
    }
  }, [mode, initialRecipient, visible]);

  useEffect(() => {
    if (mode === "reply" && originalEmail) {
      const senderId =
        originalEmail.sender_id || originalEmail.sender?.custom_id;
      const myId = user?.id;
      const iAmSender = senderId === myId;

      let toRecipients = [];
      if (replyAll) {
        const allRecipients = [
          ...(originalEmail.recipients?.to || []),
          ...(originalEmail.recipients?.cc || []),
        ]
          .map((r) => ({
            label: r.user?.username || r.name || "Unknown",
            value: r.user?.custom_id || r.recipient_id || r.id,
          }))
          .filter((r) => r.value !== myId);
        toRecipients = [
          { label: originalEmail.sender?.username, value: senderId },
          ...allRecipients,
        ];
      } else if (iAmSender && originalEmail.recipients?.to?.length > 0) {
        const first = originalEmail.recipients.to[0];
        toRecipients = [
          {
            label: first.user?.username || first.name || "Unknown",
            value: first.user?.custom_id || first.recipient_id || first.id,
          },
        ];
      } else {
        toRecipients = [
          { label: originalEmail.sender?.username, value: senderId },
        ];
      }

      setRecipients({ to: toRecipients, cc: [], bcc: [] });
      form.setFieldsValue({
        subject: originalEmail.subject?.startsWith("Re: ")
          ? originalEmail.subject
          : `Re: ${originalEmail.subject || ""}`,
      });
    } else if (mode === "forward" && originalEmail) {
      form.setFieldsValue({
        subject: originalEmail.subject?.startsWith("Fwd: ")
          ? originalEmail.subject
          : `Fwd: ${originalEmail.subject || ""}`,
      });
      setMessageContent(
        `\n\n--- Diteruskan ---\nDari: ${
          originalEmail.sender?.username
        }\nTanggal: ${dayjs(originalEmail.created_at).format(
          "D MMM YYYY HH:mm"
        )}\n\n${originalEmail.content || ""}`
      );
      if (originalEmail.attachments?.length > 0)
        setAttachments([...originalEmail.attachments]);
    } else if (mode === "draft" && originalEmail) {
      const toRecipient =
        originalEmail.recipients?.to?.map((r) => ({
          label: r.user?.username || r.name || "Unknown",
          value: r.user?.custom_id || r.recipient_id || r.id,
        })) || [];
      setRecipients({ to: toRecipient, cc: [], bcc: [] });
      form.setFieldsValue({
        subject: originalEmail.subject,
        priority: originalEmail.priority,
      });
      setMessageContent(originalEmail.content || "");
      if (originalEmail.attachments?.length > 0)
        setAttachments([...originalEmail.attachments]);
    }
  }, [mode, originalEmail, replyAll, form, user]);

  const handleSend = async () => {
    if (recipients.to.length === 0) {
      message.error("Tambahkan penerima");
      return;
    }
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      const payload = {
        ...values,
        content: messageContent,
        recipients: {
          to: recipients.to.map((r) => r.value),
          cc: recipients.cc.map((r) => r.value),
          bcc: recipients.bcc.map((r) => r.value),
        },
        attachments: extractAttachmentIds(attachments),
        type: "personal",
        originalEmailId: originalEmail?.id,
      };
      if (mode === "reply") {
        await replyToEmail.mutateAsync({
          originalEmailId: originalEmail?.id,
          ...payload,
        });
      } else {
        await sendEmail.mutateAsync(payload);
      }
      message.success("Terkirim");
      handleClose();
      onSent?.();
    } catch (error) {
      if (error?.errorFields) return;
      message.error("Gagal");
    }
  };

  const handleSaveDraft = async () => {
    const values = form.getFieldsValue();
    try {
      await saveDraft.mutateAsync({
        id: originalEmail?.id || null,
        ...values,
        content: messageContent,
        recipients: {
          to: recipients.to.map((r) => r.value),
          cc: recipients.cc.map((r) => r.value),
          bcc: recipients.bcc.map((r) => r.value),
        },
        attachments: extractAttachmentIds(attachments),
      });
      message.success("Draft tersimpan");
      onClose?.();
    } catch {
      message.error("Gagal");
    }
  };

  const handleClose = () => {
    form.resetFields();
    setRecipients({ to: [], cc: [], bcc: [] });
    setAttachments([]);
    setMessageContent("");
    setShowCc(false);
    setShowBcc(false);
    onClose?.();
  };

  const icons = {
    compose: IconMail,
    reply: IconMailReply,
    forward: IconMailForward,
    draft: IconNote,
  };
  const TitleIcon = icons[mode] || IconMail;
  const modeConfig = {
    reply: { label: "Balas", color: "green" },
    forward: { label: "Teruskan", color: "blue" },
    draft: { label: "Draft", color: "orange" },
  };

  return (
    <Modal
      title={
        <Space size={8}>
          <TitleIcon size={16} />
          <span>{title}</span>
          {mode !== "compose" && modeConfig[mode] && (
            <Tag color={modeConfig[mode].color}>{modeConfig[mode].label}</Tag>
          )}
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      width={650}
      destroyOnClose
      maskClosable={false}
      footer={
        <Space>
          <Button
            size="small"
            onClick={handleSaveDraft}
            loading={saveDraft.isLoading}
          >
            Draft
          </Button>
          <Button size="small" onClick={handleClose}>
            Batal
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={handleSend}
            loading={sendEmail.isLoading}
          >
            Kirim
          </Button>
        </Space>
      }
    >
      <Stack gap="sm">
        <RecipientSelector
          recipients={recipients}
          onChange={setRecipients}
          showCc={showCc}
          showBcc={showBcc}
          onToggleCc={() => setShowCc(true)}
          onToggleBcc={() => setShowBcc(true)}
        />
        <Form
          form={form}
          layout="vertical"
          size="small"
          initialValues={{ priority: "normal" }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <Form.Item
              name="subject"
              label="Subjek"
              rules={[{ required: true, message: "Wajib" }]}
              style={{ marginBottom: 8, flex: 1 }}
            >
              <Input placeholder="Subjek" />
            </Form.Item>
            <Form.Item
              name="priority"
              label="Prioritas"
              style={{ marginBottom: 8, width: 100 }}
            >
              <Select>
                <Select.Option value="low">Rendah</Select.Option>
                <Select.Option value="normal">Normal</Select.Option>
                <Select.Option value="high">Tinggi</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
        <div>
          <Text size="xs" fw={500} mb={4}>
            Pesan
          </Text>
          <SimpleMarkdownEditor
            value={messageContent}
            onChange={setMessageContent}
            placeholder="Tulis pesan... (mendukung markdown)"
            rows={8}
          />
        </div>
        <AttachmentUploader
          attachments={attachments}
          onChange={setAttachments}
          maxFiles={10}
          maxSize={25}
        />
      </Stack>
    </Modal>
  );
};

export default ComposeModal;

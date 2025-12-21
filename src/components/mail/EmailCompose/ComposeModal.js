import {
  useCheckTypo,
  useEmailTemplates,
  useGenerateTemplate,
  useRefineText,
  useReplyToEmail,
  useSaveDraft,
  useSendEmail,
} from "@/hooks/useEmails";
import { extractAttachmentIds } from "@/utils/debugUpload";
import {
  ActionIcon,
  Badge,
  Box,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconAbc,
  IconAlertCircle,
  IconArrowRight,
  IconBold,
  IconCheck,
  IconClipboardText,
  IconEye,
  IconFileText,
  IconItalic,
  IconList,
  IconMail,
  IconMailForward,
  IconMailReply,
  IconNote,
  IconPencil,
  IconSparkles,
  IconTemplate,
  IconX,
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
import { useCallback, useEffect, useRef, useState } from "react";
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

// AI Comparison Modal - Untuk melihat sebelum dan sesudah
const AIComparisonModal = ({
  visible,
  onClose,
  original,
  refined,
  mode,
  onUseRefined,
  onEditAgain,
}) => {
  const getModeLabel = (m) => {
    const labels = {
      professional: "Profesional",
      friendly: "Ramah",
      concise: "Ringkas",
      detailed: "Detail",
      surat_dinas: "Surat Dinas",
    };
    return labels[m] || m;
  };

  return (
    <Modal
      title={
        <Group gap={8}>
          <IconSparkles size={18} style={{ color: "#667eea" }} />
          <span>Hasil AI - Mode {getModeLabel(mode)}</span>
        </Group>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={
        <Group justify="flex-end" gap={8}>
          <Button onClick={onClose}>Batal</Button>
          <Button onClick={onEditAgain} icon={<IconPencil size={14} />}>
            Edit Lagi
          </Button>
          <Button
            type="primary"
            onClick={onUseRefined}
            icon={<IconCheck size={14} />}
          >
            Gunakan Hasil AI
          </Button>
        </Group>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 40px 1fr",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        {/* Original */}
        <Box>
          <Group gap={4} mb={8}>
            <Badge color="gray" size="sm">
              Sebelum
            </Badge>
          </Group>
          <Box
            p="sm"
            style={{
              border: "1px solid #f0f0f0",
              borderRadius: 8,
              backgroundColor: "#fafafa",
              minHeight: 200,
              maxHeight: 300,
              overflow: "auto",
            }}
          >
            <Text
              size="sm"
              style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
            >
              {original}
            </Text>
          </Box>
        </Box>

        {/* Arrow */}
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconArrowRight size={24} style={{ color: "#667eea" }} />
        </Box>

        {/* Refined */}
        <Box>
          <Group gap={4} mb={8}>
            <Badge
              color="violet"
              size="sm"
              leftSection={<IconSparkles size={10} />}
            >
              Sesudah (AI)
            </Badge>
          </Group>
          <Box
            p="sm"
            style={{
              border: "2px solid #667eea",
              borderRadius: 8,
              backgroundColor: "#f8f7ff",
              minHeight: 200,
              maxHeight: 300,
              overflow: "auto",
            }}
          >
            <Text
              size="sm"
              style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
            >
              {refined}
            </Text>
          </Box>
        </Box>
      </div>
    </Modal>
  );
};

// Typo Check Modal
const TypoCheckModal = ({ visible, onClose, data, onUseCorrected }) => {
  if (!data) return null;

  const { original, hasErrors, errors = [], correctedText, summary } = data;

  return (
    <Modal
      title={
        <Group gap={8}>
          <IconAbc size={18} style={{ color: hasErrors ? "#fa8c16" : "#52c41a" }} />
          <span>Hasil Cek Ejaan</span>
          {hasErrors ? (
            <Badge color="orange">{errors.length} kesalahan</Badge>
          ) : (
            <Badge color="green">Tidak ada kesalahan</Badge>
          )}
        </Group>
      }
      open={visible}
      onCancel={onClose}
      width={650}
      footer={
        <Group justify="flex-end" gap={8}>
          <Button onClick={onClose}>Tutup</Button>
          {hasErrors && (
            <Button
              type="primary"
              onClick={onUseCorrected}
              icon={<IconCheck size={14} />}
            >
              Gunakan Teks Perbaikan
            </Button>
          )}
        </Group>
      }
    >
      <Stack gap="md">
        {hasErrors ? (
          <>
            <Text size="sm" c="dimmed">
              {summary}
            </Text>

            {/* Error List */}
            <Box>
              <Text size="xs" fw={600} mb={8}>
                Kesalahan Ditemukan:
              </Text>
              <ScrollArea.Autosize mah={150}>
                <Stack gap={4}>
                  {errors.map((err, idx) => (
                    <Group
                      key={idx}
                      gap={8}
                      p={8}
                      style={{
                        backgroundColor: "#fff7e6",
                        borderRadius: 6,
                        border: "1px solid #ffd591",
                      }}
                    >
                      <Badge color="orange" size="xs">
                        {err.type === "typo"
                          ? "Typo"
                          : err.type === "ejaan"
                            ? "Ejaan"
                            : "Tata Bahasa"}
                      </Badge>
                      <Text size="xs" style={{ textDecoration: "line-through" }}>
                        {err.word}
                      </Text>
                      <IconArrowRight size={12} />
                      <Text size="xs" fw={600} c="green">
                        {err.suggestion}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </ScrollArea.Autosize>
            </Box>

            <Divider />

            {/* Corrected Text Preview */}
            <Box>
              <Text size="xs" fw={600} mb={8}>
                Teks Setelah Perbaikan:
              </Text>
              <Box
                p="sm"
                style={{
                  border: "2px solid #52c41a",
                  borderRadius: 8,
                  backgroundColor: "#f6ffed",
                  maxHeight: 200,
                  overflow: "auto",
                }}
              >
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {correctedText}
                </Text>
              </Box>
            </Box>
          </>
        ) : (
          <Box
            p="lg"
            style={{
              textAlign: "center",
              backgroundColor: "#f6ffed",
              borderRadius: 8,
            }}
          >
            <IconCheck size={48} style={{ color: "#52c41a", marginBottom: 8 }} />
            <Text fw={600}>Tidak ada kesalahan ejaan!</Text>
            <Text size="sm" c="dimmed">
              Teks Anda sudah benar.
            </Text>
          </Box>
        )}
      </Stack>
    </Modal>
  );
};

// Template Picker Component
const TemplatePicker = ({ onSelect, disabled }) => {
  const { data: templatesData, isLoading } = useEmailTemplates();
  const generateTemplate = useGenerateTemplate();

  const templates = templatesData?.data || [];

  const handleSelectTemplate = async (templateKey) => {
    try {
      const result = await generateTemplate.mutateAsync({
        templateType: templateKey,
      });

      if (result?.success && result?.data?.content) {
        onSelect(result.data.content, result.data.templateName);
        message.success(`Template "${result.data.templateName}" diterapkan`);
      }
    } catch (error) {
      console.error("Template error:", error);
    }
  };

  const menuItems = templates.map((t) => ({
    key: t.key,
    label: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>{t.icon}</span>
        <div>
          <div style={{ fontWeight: 500, fontSize: 12 }}>{t.name}</div>
          <div style={{ fontSize: 10, color: "#666" }}>{t.description}</div>
        </div>
      </div>
    ),
    onClick: () => handleSelectTemplate(t.key),
  }));

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["click"]}
      disabled={disabled || isLoading || generateTemplate.isLoading}
      placement="bottomRight"
    >
      <Tooltip title="Template Cepat">
        <Button
          size="small"
          type="text"
          loading={generateTemplate.isLoading}
          disabled={disabled}
          style={{
            background: "#e6f7ff",
            color: "#1890ff",
            border: "1px solid #91d5ff",
            borderRadius: 6,
            padding: "2px 8px",
            height: 24,
          }}
          icon={!generateTemplate.isLoading && <IconTemplate size={14} />}
        >
          {generateTemplate.isLoading ? "..." : "Template"}
        </Button>
      </Tooltip>
    </Dropdown>
  );
};

// Typo Check Button
const TypoCheckButton = ({ value, disabled, onResult }) => {
  const checkTypoMutation = useCheckTypo();

  const handleCheck = async () => {
    if (!value || value.trim().length === 0) {
      message.warning("Tulis pesan terlebih dahulu");
      return;
    }

    try {
      const result = await checkTypoMutation.mutateAsync({ text: value });
      if (result?.success) {
        onResult(result.data);
      }
    } catch (error) {
      console.error("Typo check error:", error);
    }
  };

  return (
    <Tooltip title="Cek Kesalahan Ejaan">
      <Button
        size="small"
        type="text"
        loading={checkTypoMutation.isLoading}
        disabled={disabled || !value}
        onClick={handleCheck}
        style={{
          background: value ? "#fff7e6" : undefined,
          color: value ? "#fa8c16" : undefined,
          border: value ? "1px solid #ffd591" : undefined,
          borderRadius: 6,
          padding: "2px 8px",
          height: 24,
        }}
        icon={!checkTypoMutation.isLoading && <IconAbc size={14} />}
      >
        {checkTypoMutation.isLoading ? "..." : "Typo"}
      </Button>
    </Tooltip>
  );
};

// AI Refine Button Component dengan comparison modal
const AIRefineButton = ({ value, onChange, disabled, onLoadingChange }) => {
  const refineText = useRefineText();
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);

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
    { type: "divider" },
    {
      key: "surat_dinas",
      label: "Surat Dinas",
      icon: "🏛️",
      description: "Format resmi pemerintah",
    },
  ];

  const isLoading = refineText.isLoading;

  // Notify parent about loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

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
        // Show comparison modal instead of direct apply
        setComparisonData({
          original: value,
          refined: result.data.refined,
          mode,
        });
        setShowComparison(true);
      }
    } catch (error) {
      console.error("Refine error:", error);
    }
  };

  const handleUseRefined = () => {
    if (comparisonData?.refined) {
      onChange(comparisonData.refined);
      message.success("Hasil AI diterapkan ✨");
    }
    setShowComparison(false);
    setComparisonData(null);
  };

  const handleEditAgain = () => {
    // Close modal, keep original text
    setShowComparison(false);
    setComparisonData(null);
  };

  const menuItems = aiModes.map((mode) =>
    mode.type === "divider"
      ? { type: "divider" }
      : {
    key: mode.key,
    label: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>{mode.icon}</span>
        <div>
          <div style={{ fontWeight: 500, fontSize: 12 }}>{mode.label}</div>
                <div style={{ fontSize: 10, color: "#666" }}>
                  {mode.description}
                </div>
        </div>
      </div>
    ),
    onClick: () => handleRefine(mode.key),
        }
  );

  return (
    <>
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
              boxShadow: value
                ? "0 2px 8px rgba(102, 126, 234, 0.3)"
                : undefined,
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

      {/* Comparison Modal */}
      <AIComparisonModal
        visible={showComparison}
        onClose={() => setShowComparison(false)}
        original={comparisonData?.original}
        refined={comparisonData?.refined}
        mode={comparisonData?.mode}
        onUseRefined={handleUseRefined}
        onEditAgain={handleEditAgain}
      />
    </>
  );
};

// Simple Markdown Editor dengan toolbar dan preview
const SimpleMarkdownEditor = ({ value, onChange, placeholder, rows = 8 }) => {
  const textareaRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [typoModalVisible, setTypoModalVisible] = useState(false);
  const [typoData, setTypoData] = useState(null);

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

  const handleTemplateSelect = (templateContent, templateName) => {
    // If there's existing content, ask or append
    if (value && value.trim().length > 0) {
      Modal.confirm({
        title: "Terapkan Template",
        content: `Template "${templateName}" akan mengganti isi pesan saat ini. Lanjutkan?`,
        okText: "Ganti",
        cancelText: "Batal",
        onOk: () => onChange(templateContent),
      });
    } else {
      onChange(templateContent);
    }
  };

  const handleTypoResult = (data) => {
    setTypoData(data);
    setTypoModalVisible(true);
  };

  const handleUseCorrectedText = () => {
    if (typoData?.correctedText) {
      onChange(typoData.correctedText);
      message.success("Teks diperbaiki");
    }
    setTypoModalVisible(false);
    setTypoData(null);
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
          {/* Template Button */}
          <TemplatePicker onSelect={handleTemplateSelect} disabled={isDisabled} />

          {/* Typo Check Button */}
          <TypoCheckButton
            value={value}
            disabled={isDisabled}
            onResult={handleTypoResult}
          />

          {/* AI Refine Button */}
          <AIRefineButton
            value={value}
            onChange={onChange}
            disabled={showPreview}
            onLoadingChange={setAiLoading}
          />

          {/* Preview Button */}
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

      {/* Typo Check Modal */}
      <TypoCheckModal
        visible={typoModalVisible}
        onClose={() => setTypoModalVisible(false)}
        data={typoData}
        onUseCorrected={handleUseCorrectedText}
      />
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

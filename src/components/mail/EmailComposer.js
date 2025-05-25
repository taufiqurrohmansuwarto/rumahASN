import {
  useGetDraft,
  useSaveDraft,
  useSendEmail,
  useUpdateDraft,
} from "@/hooks/useEmails";
import { searchUsers } from "@/services/rasn-mail.services";
import {
  CloseOutlined,
  EyeOutlined,
  PaperClipOutlined,
  SaveOutlined,
  SendOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Tabs,
  Tag,
  Typography,
  Upload,
} from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";

const { TextArea } = Input;
const { Title, Text } = Typography;

// 1. Composer Header Component
const ComposerHeader = ({ title, autoSaveStatus, onClose }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
      }}
    >
      <Title level={4} style={{ margin: 0 }}>
        {title}
      </Title>
      <Space>
        {autoSaveStatus && (
          <Text
            type="secondary"
            style={{
              fontSize: "12px",
              color: autoSaveStatus.includes("Error") ? "#ff4d4f" : "#52c41a",
            }}
          >
            {autoSaveStatus}
          </Text>
        )}
        {onClose && (
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
        )}
      </Space>
    </div>
  );
};

// 2. Recipients Section Component
const RecipientsSection = ({
  recipients,
  onRecipientChange,
  showCc,
  showBcc,
  onShowCc,
  onShowBcc,
  userSearchResults,
  isSearchingUsers,
  onUserSearch,
  renderUserOption,
}) => {
  return (
    <div
      style={{
        border: "1px solid #d9d9d9",
        borderRadius: "6px",
        padding: "16px",
        marginBottom: "16px",
        backgroundColor: "#fafafa",
      }}
    >
      {/* To Field */}
      <Form.Item label="Kepada" required style={{ marginBottom: "12px" }}>
        <Select
          mode="multiple"
          placeholder="Ketik nama pengguna untuk mencari..."
          value={recipients.to}
          onChange={(value, options) => onRecipientChange("to", options)}
          onSearch={onUserSearch}
          loading={isSearchingUsers}
          showSearch
          filterOption={false}
          notFoundContent={
            isSearchingUsers
              ? "Mencari pengguna..."
              : userSearchResults.length === 0
              ? "Ketik minimal 2 karakter untuk mencari"
              : "Tidak ada pengguna ditemukan"
          }
          style={{ width: "100%" }}
          suffixIcon={<UserAddOutlined />}
          optionLabelProp="label"
        >
          {userSearchResults.map((user) => (
            <Select.Option
              key={user.value}
              value={user.value}
              label={user.label}
            >
              {renderUserOption(user)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* CC Field */}
      {showCc && (
        <Form.Item label="CC" style={{ marginBottom: "12px" }}>
          <Select
            mode="multiple"
            placeholder="Ketik nama pengguna untuk menambah CC..."
            value={recipients.cc}
            onChange={(value, options) => onRecipientChange("cc", options)}
            onSearch={onUserSearch}
            loading={isSearchingUsers}
            showSearch
            filterOption={false}
            notFoundContent={
              isSearchingUsers
                ? "Mencari pengguna..."
                : "Ketik minimal 2 karakter untuk mencari"
            }
            style={{ width: "100%" }}
            optionLabelProp="label"
          >
            {userSearchResults.map((user) => (
              <Select.Option
                key={user.value}
                value={user.value}
                label={user.label}
              >
                {renderUserOption(user)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}

      {/* BCC Field */}
      {showBcc && (
        <Form.Item label="BCC" style={{ marginBottom: "12px" }}>
          <Select
            mode="multiple"
            placeholder="Ketik nama pengguna untuk menambah BCC..."
            value={recipients.bcc}
            onChange={(value, options) => onRecipientChange("bcc", options)}
            onSearch={onUserSearch}
            loading={isSearchingUsers}
            showSearch
            filterOption={false}
            notFoundContent={
              isSearchingUsers
                ? "Mencari pengguna..."
                : "Ketik minimal 2 karakter untuk mencari"
            }
            style={{ width: "100%" }}
            optionLabelProp="label"
          >
            {userSearchResults.map((user) => (
              <Select.Option
                key={user.value}
                value={user.value}
                label={user.label}
              >
                {renderUserOption(user)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )}

      {/* CC/BCC Toggle Buttons */}
      <Space style={{ marginBottom: "8px" }}>
        {!showCc && (
          <Button type="link" size="small" onClick={onShowCc}>
            + CC
          </Button>
        )}
        {!showBcc && (
          <Button type="link" size="small" onClick={onShowBcc}>
            + BCC
          </Button>
        )}
      </Space>
    </div>
  );
};

// 3. Subject and Priority Component
const SubjectPrioritySection = () => {
  return (
    <Row gutter={16}>
      <Col span={18}>
        <Form.Item
          name="subject"
          label="Subjek"
          rules={[{ required: true, message: "Mohon isi subjek email" }]}
        >
          <Input placeholder="Subjek email..." size="large" />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item name="priority" label="Prioritas">
          <Select size="large">
            <Select.Option value="low">Rendah</Select.Option>
            <Select.Option value="normal">Normal</Select.Option>
            <Select.Option value="high">Tinggi</Select.Option>
          </Select>
        </Form.Item>
      </Col>
    </Row>
  );
};

// 4. Message Content Component
const MessageContentSection = ({
  messageContent,
  onContentChange,
  isMarkdown,
  onMarkdownToggle,
  standalone,
}) => {
  return (
    <Form.Item
      label={
        <Space>
          <span>Pesan</span>
          <Switch
            checkedChildren="Markdown"
            unCheckedChildren="Plain"
            checked={isMarkdown}
            onChange={onMarkdownToggle}
            size="small"
          />
        </Space>
      }
    >
      <TextArea
        value={messageContent}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder={
          isMarkdown
            ? "Tulis pesan Anda dengan format Markdown...\n\n**Tebal**, *Miring*, `kode`\n\n- List item\n- List item\n\n[Link](https://example.com)"
            : "Tulis pesan Anda..."
        }
        rows={standalone ? 12 : 8}
        style={{
          fontSize: "14px",
          lineHeight: "1.6",
          fontFamily: isMarkdown
            ? 'Monaco, "Courier New", monospace'
            : "inherit",
        }}
      />
    </Form.Item>
  );
};

// 5. Attachments Component
const AttachmentsSection = ({
  attachments,
  onAttachmentsChange,
  onRemoveAttachment,
}) => {
  const uploadProps = {
    name: "attachments",
    action: "/api/mail/attachments/upload",
    multiple: true,
    beforeUpload: (file) => {
      const isLt25M = file.size / 1024 / 1024 < 25;
      if (!isLt25M) {
        message.error("File harus lebih kecil dari 25MB!");
      }
      return isLt25M;
    },
    onChange: ({ fileList }) => {
      onAttachmentsChange(fileList);
    },
    onRemove: (file) => {
      onRemoveAttachment(file);
    },
  };

  return (
    <Form.Item label="Lampiran">
      <Upload.Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <PaperClipOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
        </p>
        <p className="ant-upload-text">
          Klik atau seret file ke area ini untuk upload
        </p>
        <p className="ant-upload-hint">
          Mendukung multiple file. Maksimal 25MB per file.
        </p>
      </Upload.Dragger>

      {/* Attachment List */}
      {attachments.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <Text strong>File terlampir:</Text>
          <div style={{ marginTop: "8px" }}>
            {attachments.map((file, index) => (
              <Tag
                key={index}
                closable
                style={{ margin: "4px" }}
                onClose={() => onRemoveAttachment(file)}
              >
                {file.name || file.file_name}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </Form.Item>
  );
};

// 6. Compose Actions Component
const ComposeActions = ({
  onSaveDraft,
  onCancel,
  onSend,
  isSavingDraft,
  isSending,
  standalone,
}) => {
  if (!standalone) return null;

  return (
    <div style={{ textAlign: "right", marginTop: "24px" }}>
      <Space>
        <Button
          icon={<SaveOutlined />}
          onClick={onSaveDraft}
          loading={isSavingDraft}
        >
          Simpan Draft
        </Button>
        <Button onClick={onCancel}>Batal</Button>
        <Button
          type="primary"
          icon={<SendOutlined />}
          htmlType="submit"
          loading={isSending}
        >
          Kirim
        </Button>
      </Space>
    </div>
  );
};

// 7. Preview Component
const EmailPreview = ({
  form,
  recipients,
  messageContent,
  isMarkdown,
  attachments,
}) => {
  return (
    <div
      style={{
        minHeight: "400px",
        padding: "24px",
        border: "1px solid #d9d9d9",
        borderRadius: "6px",
        backgroundColor: "#fafafa",
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <Text strong>Subjek: </Text>
        <Text>{form.getFieldValue("subject") || "Belum ada subjek"}</Text>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <Text strong>Kepada: </Text>
        {recipients.to.length === 0 ? (
          <Text type="secondary">Belum ada penerima</Text>
        ) : (
          recipients.to.map((r) => (
            <Tag key={r.value} style={{ margin: "2px" }}>
              <Space>
                <Avatar
                  src={r.user?.image}
                  size="small"
                  icon={<UserOutlined />}
                />
                {r.label}
              </Space>
            </Tag>
          ))
        )}
      </div>

      {recipients.cc.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <Text strong>CC: </Text>
          {recipients.cc.map((r) => (
            <Tag key={r.value} style={{ margin: "2px" }}>
              <Space>
                <Avatar
                  src={r.user?.image}
                  size="small"
                  icon={<UserOutlined />}
                />
                {r.label}
              </Space>
            </Tag>
          ))}
        </div>
      )}

      {recipients.bcc.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <Text strong>BCC: </Text>
          {recipients.bcc.map((r) => (
            <Tag key={r.value} style={{ margin: "2px" }}>
              <Space>
                <Avatar
                  src={r.user?.image}
                  size="small"
                  icon={<UserOutlined />}
                />
                {r.label}
              </Space>
            </Tag>
          ))}
        </div>
      )}

      <Divider />

      <div
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "4px",
          border: "1px solid #e8e8e8",
        }}
      >
        {isMarkdown ? (
          <ReactMarkdownCustom>
            {messageContent || "*Belum ada konten pesan*"}
          </ReactMarkdownCustom>
        ) : (
          <div style={{ whiteSpace: "pre-wrap" }}>
            {messageContent || "Belum ada konten pesan"}
          </div>
        )}
      </div>

      {attachments.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <Text strong>Lampiran: </Text>
          {attachments.map((file, index) => (
            <Tag key={index} icon={<PaperClipOutlined />}>
              {file.name || file.file_name}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
};

// 8. Compose Form Component
const ComposeForm = ({
  form,
  recipients,
  onRecipientChange,
  showCc,
  showBcc,
  onShowCc,
  onShowBcc,
  userSearchResults,
  isSearchingUsers,
  onUserSearch,
  renderUserOption,
  messageContent,
  onContentChange,
  isMarkdown,
  onMarkdownToggle,
  attachments,
  onAttachmentsChange,
  onRemoveAttachment,
  onSaveDraft,
  onCancel,
  onSend,
  isSavingDraft,
  isSending,
  standalone,
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSend}
      initialValues={{
        priority: "normal",
      }}
    >
      {/* Recipients Section */}
      <RecipientsSection
        recipients={recipients}
        onRecipientChange={onRecipientChange}
        showCc={showCc}
        showBcc={showBcc}
        onShowCc={onShowCc}
        onShowBcc={onShowBcc}
        userSearchResults={userSearchResults}
        isSearchingUsers={isSearchingUsers}
        onUserSearch={onUserSearch}
        renderUserOption={renderUserOption}
      />

      {/* Subject and Priority */}
      <SubjectPrioritySection />

      {/* Message Content */}
      <MessageContentSection
        messageContent={messageContent}
        onContentChange={onContentChange}
        isMarkdown={isMarkdown}
        onMarkdownToggle={onMarkdownToggle}
        standalone={standalone}
      />

      {/* Attachments */}
      <AttachmentsSection
        attachments={attachments}
        onAttachmentsChange={onAttachmentsChange}
        onRemoveAttachment={onRemoveAttachment}
      />

      {/* Actions */}
      <ComposeActions
        onSaveDraft={onSaveDraft}
        onCancel={onCancel}
        onSend={onSend}
        isSavingDraft={isSavingDraft}
        isSending={isSending}
        standalone={standalone}
      />
    </Form>
  );
};

// 9. Compose Tabs Component
const ComposeTabs = ({
  activeTab,
  onTabChange,
  form,
  recipients,
  onRecipientChange,
  showCc,
  showBcc,
  onShowCc,
  onShowBcc,
  userSearchResults,
  isSearchingUsers,
  onUserSearch,
  renderUserOption,
  messageContent,
  onContentChange,
  isMarkdown,
  onMarkdownToggle,
  attachments,
  onAttachmentsChange,
  onRemoveAttachment,
  onSaveDraft,
  onCancel,
  onSend,
  isSavingDraft,
  isSending,
  standalone,
}) => {
  return (
    <Tabs
      activeKey={activeTab}
      onChange={onTabChange}
      items={[
        {
          key: "compose",
          label: "Tulis",
          children: (
            <ComposeForm
              form={form}
              recipients={recipients}
              onRecipientChange={onRecipientChange}
              showCc={showCc}
              showBcc={showBcc}
              onShowCc={onShowCc}
              onShowBcc={onShowBcc}
              userSearchResults={userSearchResults}
              isSearchingUsers={isSearchingUsers}
              onUserSearch={onUserSearch}
              renderUserOption={renderUserOption}
              messageContent={messageContent}
              onContentChange={onContentChange}
              isMarkdown={isMarkdown}
              onMarkdownToggle={onMarkdownToggle}
              attachments={attachments}
              onAttachmentsChange={onAttachmentsChange}
              onRemoveAttachment={onRemoveAttachment}
              onSaveDraft={onSaveDraft}
              onCancel={onCancel}
              onSend={onSend}
              isSavingDraft={isSavingDraft}
              isSending={isSending}
              standalone={standalone}
            />
          ),
        },
        {
          key: "preview",
          label: (
            <Space>
              <EyeOutlined />
              Preview
            </Space>
          ),
          children: (
            <EmailPreview
              form={form}
              recipients={recipients}
              messageContent={messageContent}
              isMarkdown={isMarkdown}
              attachments={attachments}
            />
          ),
        },
      ]}
    />
  );
};

// Main EmailComposer Component
const EmailComposer = ({
  // Modal props
  visible = false,
  onClose,
  onSent,

  // Compose mode props
  mode = "compose", // compose, reply, forward
  originalEmail = null,
  replyAll = false,

  // Display props
  standalone = false,
  title = "Tulis Email Baru",

  // Draft props
  draftId = null,

  // Callback props
  onDraft,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("compose");
  const [recipients, setRecipients] = useState({ to: [], cc: [], bcc: [] });
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [isMarkdown, setIsMarkdown] = useState(false);

  // User search states
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Auto-save states
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const [currentDraftId, setCurrentDraftId] = useState(draftId);

  // Refs for cleanup
  const debounceRef = useRef(null);
  const autoSaveRef = useRef(null);

  // Hooks
  const sendEmail = useSendEmail();
  const saveDraft = useSaveDraft();
  const updateDraft = useUpdateDraft();

  // Load draft if editing
  const {
    data: draftData,
    isLoading: isDraftLoading,
    error: draftError,
  } = useGetDraft(draftId);

  // Initialize form based on mode or draft
  useEffect(() => {
    if (mode === "reply" && originalEmail) {
      initializeReply();
    } else if (mode === "forward" && originalEmail) {
      initializeForward();
    } else if (draftData?.data) {
      initializeDraft(draftData.data);
    }
  }, [mode, originalEmail, replyAll, draftData]);

  const initializeReply = () => {
    const toRecipients = replyAll
      ? [
          ...(originalEmail.recipients?.filter((r) => r.type === "to") || []),
          ...(originalEmail.recipients?.filter((r) => r.type === "cc") || []),
        ].filter((r) => r.recipient_id !== originalEmail.sender_id)
      : [
          {
            label: originalEmail.sender?.username,
            value: originalEmail.sender_id,
            user: originalEmail.sender,
          },
        ];

    setRecipients({
      to: toRecipients,
      cc: [],
      bcc: [],
    });

    form.setFieldsValue({
      subject: originalEmail.subject?.startsWith("Re: ")
        ? originalEmail.subject
        : `Re: ${originalEmail.subject}`,
      priority: "normal",
    });

    setMessageContent(
      `\n\n--- Pesan Asli ---\nDari: ${originalEmail.sender?.username}\nTanggal: ${originalEmail.created_at}\nSubjek: ${originalEmail.subject}\n\n${originalEmail.content}`
    );
  };

  const initializeForward = () => {
    form.setFieldsValue({
      subject: originalEmail.subject?.startsWith("Fwd: ")
        ? originalEmail.subject
        : `Fwd: ${originalEmail.subject}`,
      priority: "normal",
    });

    setMessageContent(
      `\n\n--- Pesan Diteruskan ---\nDari: ${originalEmail.sender?.username}\nTanggal: ${originalEmail.created_at}\nSubjek: ${originalEmail.subject}\n\n${originalEmail.content}`
    );

    if (originalEmail.attachments?.length > 0) {
      setAttachments(originalEmail.attachments);
    }
  };

  const initializeDraft = (draft) => {
    form.setFieldsValue({
      subject: draft.subject || "",
      priority: draft.priority || "normal",
    });

    setMessageContent(draft.content || "");

    if (draft.recipients) {
      const toRecipients = draft.recipients
        .filter((r) => r.type === "to")
        .map((r) => ({
          value: r.recipient_id,
          label: r.user?.username,
          user: r.user,
        }));

      const ccRecipients = draft.recipients
        .filter((r) => r.type === "cc")
        .map((r) => ({
          value: r.recipient_id,
          label: r.user?.username,
          user: r.user,
        }));

      const bccRecipients = draft.recipients
        .filter((r) => r.type === "bcc")
        .map((r) => ({
          value: r.recipient_id,
          label: r.user?.username,
          user: r.user,
        }));

      setRecipients({
        to: toRecipients,
        cc: ccRecipients,
        bcc: bccRecipients,
      });

      if (ccRecipients.length > 0) setShowCc(true);
      if (bccRecipients.length > 0) setShowBcc(true);
    }

    if (draft.attachments?.length > 0) {
      setAttachments(draft.attachments);
    }
  };

  // Debounced user search
  const debouncedUserSearch = useCallback(async (searchText) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (!searchText || searchText.length < 2) {
        setUserSearchResults([]);
        setIsSearchingUsers(false);
        return;
      }

      setIsSearchingUsers(true);
      try {
        const response = await searchUsers(searchText);
        if (response.success) {
          const formattedUsers = response.data.map((user) => ({
            label: user.username,
            value: user.id,
            user: user,
          }));
          setUserSearchResults(formattedUsers);
        }
      } catch (error) {
        console.error("Search users error:", error);
        message.error("Gagal mencari pengguna");
        setUserSearchResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300);
  }, []);

  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }

    autoSaveRef.current = setTimeout(async () => {
      const values = form.getFieldsValue();

      // Only auto-save if there's meaningful content
      if (
        !values.subject?.trim() &&
        !messageContent?.trim() &&
        recipients.to.length === 0
      ) {
        return;
      }

      try {
        setAutoSaveStatus("Menyimpan...");

        const draftData = {
          subject: values.subject || "",
          content: messageContent,
          recipients: {
            to: recipients.to.map((r) => r.value),
            cc: recipients.cc.map((r) => r.value),
            bcc: recipients.bcc.map((r) => r.value),
          },
          attachments: attachments.map((att) => att.response?.id || att.id),
          priority: values.priority || "normal",
        };

        let result;
        if (currentDraftId) {
          result = await updateDraft.mutateAsync({
            id: currentDraftId,
            data: draftData,
          });
        } else {
          result = await saveDraft.mutateAsync(draftData);
          if (result?.data?.id) {
            setCurrentDraftId(result.data.id);
          }
        }

        setAutoSaveStatus("Tersimpan");
        setTimeout(() => setAutoSaveStatus(""), 2000);
      } catch (error) {
        console.error("Auto-save error:", error);
        setAutoSaveStatus("Error menyimpan");
        setTimeout(() => setAutoSaveStatus(""), 3000);
      }
    }, 2000);
  }, [
    form,
    messageContent,
    recipients,
    attachments,
    currentDraftId,
    saveDraft,
    updateDraft,
  ]);

  // Trigger auto-save on changes
  useEffect(() => {
    if (standalone) {
      performAutoSave();
    }
  }, [messageContent, recipients, performAutoSave, standalone]);

  // Handle user search
  const handleUserSearch = (searchText) => {
    debouncedUserSearch(searchText);
  };

  // Handle form submission
  const handleSend = async (values) => {
    // Validation
    if (recipients.to.length === 0) {
      message.error("Mohon tambahkan minimal satu penerima");
      return;
    }

    if (!values.subject?.trim()) {
      message.error("Mohon isi subjek email");
      return;
    }

    if (!messageContent?.trim()) {
      message.error("Mohon isi konten email");
      return;
    }

    try {
      const emailData = {
        subject: values.subject,
        content: messageContent,
        recipients: {
          to: recipients.to.map((r) => r.value),
          cc: recipients.cc.map((r) => r.value),
          bcc: recipients.bcc.map((r) => r.value),
        },
        attachments: attachments.map((att) => att.response?.id || att.id),
        type: "personal",
        priority: values.priority || "normal",
        parentId:
          mode === "reply" || mode === "forward" ? originalEmail?.id : null,
      };

      await sendEmail.mutateAsync(emailData);

      message.success("Email berhasil dikirim!");
      handleReset();
      onSent?.();
    } catch (error) {
      console.error("Send email error:", error);
      message.error("Gagal mengirim email");
    }
  };

  // Handle save draft manually
  const handleSaveDraft = async () => {
    const values = form.getFieldsValue();

    try {
      const draftData = {
        subject: values.subject || "",
        content: messageContent,
        recipients: {
          to: recipients.to.map((r) => r.value),
          cc: recipients.cc.map((r) => r.value),
          bcc: recipients.bcc.map((r) => r.value),
        },
        attachments: attachments.map((att) => att.response?.id || att.id),
        priority: values.priority || "normal",
      };

      let result;
      if (currentDraftId) {
        result = await updateDraft.mutateAsync({
          id: currentDraftId,
          data: draftData,
        });
      } else {
        result = await saveDraft.mutateAsync(draftData);
        if (result?.data?.id) {
          setCurrentDraftId(result.data.id);
        }
      }

      message.success("Draft tersimpan");
      onDraft?.(result?.data);
    } catch (error) {
      console.error("Save draft error:", error);
      message.error("Gagal menyimpan draft");
    }
  };

  // Handle recipient change
  const handleRecipientChange = (type, selectedOptions) => {
    setRecipients((prev) => ({
      ...prev,
      [type]: selectedOptions || [],
    }));
  };

  // Handle attachments
  const handleAttachmentsChange = (fileList) => {
    setAttachments(fileList);
  };

  const handleRemoveAttachment = (file) => {
    setAttachments((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  // Handle reset/close
  const handleReset = () => {
    form.resetFields();
    setRecipients({ to: [], cc: [], bcc: [] });
    setAttachments([]);
    setMessageContent("");
    setActiveTab("compose");
    setUserSearchResults([]);
    setShowCc(false);
    setShowBcc(false);
    setAutoSaveStatus("");
    setCurrentDraftId(null);
  };

  const handleClose = () => {
    handleReset();
    onClose?.();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, []);

  // Custom option renderer for user search results
  const renderUserOption = (user) => (
    <div style={{ display: "flex", alignItems: "center", padding: "4px 0" }}>
      <Avatar
        src={user.user?.image}
        size="small"
        icon={<UserOutlined />}
        style={{ marginRight: "8px" }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "500" }}>{user.user?.username}</div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          {user.user?.email || user.user?.org_id || "No Organization"}
        </div>
      </div>
    </div>
  );

  // Loading state for draft
  if (isDraftLoading) {
    return (
      <div style={{ textAlign: "center", padding: "48px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>
          <Text type="secondary">Memuat draft...</Text>
        </div>
      </div>
    );
  }

  // Error state for draft
  if (draftError) {
    return (
      <Alert
        message="Gagal memuat draft"
        description="Terjadi kesalahan saat memuat draft. Silakan coba lagi."
        type="error"
        showIcon
        action={
          <Button size="small" onClick={onClose}>
            Tutup
          </Button>
        }
      />
    );
  }

  // Render compose content
  const renderComposeContent = () => (
    <div style={{ position: "relative" }}>
      <ComposeTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        form={form}
        recipients={recipients}
        onRecipientChange={handleRecipientChange}
        showCc={showCc}
        showBcc={showBcc}
        onShowCc={() => setShowCc(true)}
        onShowBcc={() => setShowBcc(true)}
        userSearchResults={userSearchResults}
        isSearchingUsers={isSearchingUsers}
        onUserSearch={handleUserSearch}
        renderUserOption={renderUserOption}
        messageContent={messageContent}
        onContentChange={setMessageContent}
        isMarkdown={isMarkdown}
        onMarkdownToggle={setIsMarkdown}
        attachments={attachments}
        onAttachmentsChange={handleAttachmentsChange}
        onRemoveAttachment={handleRemoveAttachment}
        onSaveDraft={handleSaveDraft}
        onCancel={handleClose}
        onSend={handleSend}
        isSavingDraft={saveDraft.isLoading || updateDraft.isLoading}
        isSending={sendEmail.isLoading}
        standalone={standalone}
      />
    </div>
  );

  // Render as Modal
  if (!standalone) {
    return (
      <Modal
        title={<ComposerHeader title={title} autoSaveStatus={autoSaveStatus} />}
        open={visible}
        onCancel={handleClose}
        width={900}
        destroyOnClose
        footer={[
          <Button
            key="draft"
            icon={<SaveOutlined />}
            onClick={handleSaveDraft}
            loading={saveDraft.isLoading || updateDraft.isLoading}
          >
            Simpan Draft
          </Button>,
          <Button key="cancel" onClick={handleClose}>
            Batal
          </Button>,
          <Button
            key="send"
            type="primary"
            icon={<SendOutlined />}
            onClick={() => form.submit()}
            loading={sendEmail.isLoading}
          >
            Kirim
          </Button>,
        ]}
      >
        {renderComposeContent()}
      </Modal>
    );
  }

  // Render as Standalone Card
  return (
    <Card
      title={
        <ComposerHeader
          title={title}
          autoSaveStatus={autoSaveStatus}
          onClose={onClose}
        />
      }
      style={{
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      }}
    >
      {renderComposeContent()}
    </Card>
  );
};

export default EmailComposer;

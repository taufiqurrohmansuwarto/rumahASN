import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Select,
  Divider,
  message,
  Typography,
  Upload,
  Tag,
  Row,
  Col,
  Tabs,
  Switch,
  Modal,
  Avatar,
} from "antd";
import {
  SendOutlined,
  PaperClipOutlined,
  EyeOutlined,
  SaveOutlined,
  CloseOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useSendEmail, useSaveDraft } from "@/hooks/useEmails";
import { searchUsers } from "@/services/rasn-mail.services";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";
import { useCallback, useRef } from "react";

const { TextArea } = Input;
const { Title, Text } = Typography;

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

  const sendEmail = useSendEmail();
  const saveDraft = useSaveDraft();

  // Custom debounce hook implementation
  const debounceRef = useRef(null);

  const debouncedUserSearch = useCallback(async (searchText) => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
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
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Handle user search
  const handleUserSearch = (searchText) => {
    debouncedUserSearch(searchText);
  };

  // Initialize form based on mode
  useEffect(() => {
    if (mode === "reply" && originalEmail) {
      const toRecipients = replyAll
        ? [
            ...(originalEmail.recipients?.to || []),
            ...(originalEmail.recipients?.cc || []),
          ]
        : [
            {
              label: originalEmail.sender_name,
              value: originalEmail.sender_id,
            },
          ];

      setRecipients({
        to: toRecipients.filter((r) => r.value !== originalEmail.sender_id),
        cc: [],
        bcc: [],
      });

      form.setFieldsValue({
        subject: originalEmail.subject.startsWith("Re: ")
          ? originalEmail.subject
          : `Re: ${originalEmail.subject}`,
      });

      setMessageContent(
        `\n\n--- Pesan Asli ---\nDari: ${originalEmail.sender_name}\nTanggal: ${originalEmail.created_at}\nSubjek: ${originalEmail.subject}\n\n${originalEmail.content}`
      );
    } else if (mode === "forward" && originalEmail) {
      form.setFieldsValue({
        subject: originalEmail.subject.startsWith("Fwd: ")
          ? originalEmail.subject
          : `Fwd: ${originalEmail.subject}`,
      });

      setMessageContent(
        `\n\n--- Pesan Diteruskan ---\nDari: ${originalEmail.sender_name}\nTanggal: ${originalEmail.created_at}\nSubjek: ${originalEmail.subject}\n\n${originalEmail.content}`
      );

      // Include original attachments
      if (originalEmail.attachments) {
        setAttachments(originalEmail.attachments);
      }
    }
  }, [mode, originalEmail, replyAll, form]);

  // Handle form submission
  const handleSend = async (values) => {
    if (recipients.to.length === 0) {
      message.error("Mohon tambahkan minimal satu penerima");
      return;
    }

    try {
      await sendEmail.mutateAsync({
        ...values,
        content: messageContent,
        recipients: {
          to: recipients.to.map((r) => r.value),
          cc: recipients.cc.map((r) => r.value),
          bcc: recipients.bcc.map((r) => r.value),
        },
        attachments: attachments.map((att) => att.response?.id || att.id),
        type: "personal",
        parentId:
          mode === "reply" || mode === "forward" ? originalEmail?.id : null,
      });

      message.success("Email berhasil dikirim!");

      // Reset form
      form.resetFields();
      setRecipients({ to: [], cc: [], bcc: [] });
      setAttachments([]);
      setMessageContent("");

      onSent?.();
    } catch (error) {
      message.error("Gagal mengirim email");
    }
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    const values = form.getFieldsValue();

    try {
      await saveDraft.mutateAsync({
        ...values,
        content: messageContent,
        recipients,
        attachments: attachments.map((att) => att.response?.id || att.id),
      });

      message.success("Draft tersimpan");
      onDraft?.();
    } catch (error) {
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
          {user.user?.org_id || "No Organization"}
        </div>
      </div>
    </div>
  );

  // Handle attachment upload
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
      setAttachments(fileList);
    },
  };

  // Handle close
  const handleClose = () => {
    form.resetFields();
    setRecipients({ to: [], cc: [], bcc: [] });
    setAttachments([]);
    setMessageContent("");
    setActiveTab("compose");
    setUserSearchResults([]);
    onClose?.();
  };

  // Render compose content
  const renderComposeContent = () => (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={[
        {
          key: "compose",
          label: "Tulis",
          children: (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSend}
              initialValues={{
                priority: "normal",
              }}
            >
              {/* Recipients Section */}
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
                <Form.Item
                  label="Kepada"
                  required
                  style={{ marginBottom: "12px" }}
                >
                  <Select
                    mode="multiple"
                    placeholder="Ketik nama pengguna untuk mencari..."
                    value={recipients.to}
                    onChange={(value, options) =>
                      handleRecipientChange("to", options)
                    }
                    onSearch={handleUserSearch}
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
                      onChange={(value, options) =>
                        handleRecipientChange("cc", options)
                      }
                      onSearch={handleUserSearch}
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
                      onChange={(value, options) =>
                        handleRecipientChange("bcc", options)
                      }
                      onSearch={handleUserSearch}
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
                          image={user?.image}
                          value={user.id}
                          label={user.username}
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
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setShowCc(true)}
                    >
                      + CC
                    </Button>
                  )}
                  {!showBcc && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setShowBcc(true)}
                    >
                      + BCC
                    </Button>
                  )}
                </Space>
              </div>

              {/* Subject and Priority */}
              <Row gutter={16}>
                <Col span={18}>
                  <Form.Item
                    name="subject"
                    label="Subjek"
                    rules={[
                      { required: true, message: "Mohon isi subjek email" },
                    ]}
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

              {/* Message Content */}
              <Form.Item
                label={
                  <Space>
                    <span>Pesan</span>
                    <Switch
                      checkedChildren="Markdown"
                      unCheckedChildren="Plain"
                      checked={isMarkdown}
                      onChange={setIsMarkdown}
                      size="small"
                    />
                  </Space>
                }
              >
                <TextArea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
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

              {/* Attachments */}
              <Form.Item label="Lampiran">
                <Upload.Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <PaperClipOutlined
                      style={{ fontSize: "32px", color: "#1890ff" }}
                    />
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
                    {attachments.map((file, index) => (
                      <Tag
                        key={index}
                        closable
                        style={{ margin: "4px" }}
                        onClose={() => {
                          setAttachments((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        {file.name}
                      </Tag>
                    ))}
                  </div>
                )}
              </Form.Item>

              {/* Action Buttons for Standalone */}
              {standalone && (
                <div style={{ textAlign: "right", marginTop: "24px" }}>
                  <Space>
                    <Button
                      icon={<SaveOutlined />}
                      onClick={handleSaveDraft}
                      loading={saveDraft.isLoading}
                    >
                      Simpan Draft
                    </Button>
                    <Button onClick={handleClose}>Batal</Button>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      htmlType="submit"
                      loading={sendEmail.isLoading}
                    >
                      Kirim
                    </Button>
                  </Space>
                </div>
              )}
            </Form>
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
                <Text>
                  {form.getFieldValue("subject") || "Belum ada subjek"}
                </Text>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <Text strong>Kepada: </Text>
                {recipients.to.map((r) => (
                  <Tag key={r.value} style={{ margin: "2px" }}>
                    <Space>
                      <Avatar
                        src={r?.image}
                        size="small"
                        icon={<UserOutlined />}
                      />
                      {r.label}
                    </Space>
                  </Tag>
                ))}
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
                      {file.name}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          ),
        },
      ]}
    />
  );

  // Render as Modal
  if (!standalone) {
    return (
      <Modal
        title={title}
        open={visible}
        onCancel={handleClose}
        width={900}
        destroyOnClose
        footer={[
          <Button
            key="draft"
            icon={<SaveOutlined />}
            onClick={handleSaveDraft}
            loading={saveDraft.isLoading}
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
      title={title}
      extra={
        onClose && (
          <Button type="text" icon={<CloseOutlined />} onClick={handleClose} />
        )
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

import { useSaveDraft, useSendEmail } from "@/hooks/useEmails";
import {
  EyeOutlined,
  SaveOutlined,
  SendOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tabs,
  message,
  Card,
  Badge,
  Divider,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import AttachmentUploader from "./AttachmentUploader";
import EmailEditor from "./EmailEditor";
import EmailPreview from "./EmailPreview";
import RecipientSelector from "./RecipientSelector";
import { useSession } from "next-auth/react";
import { debugUploadState, extractAttachmentIds } from "@/utils/debugUpload";

const ComposeModal = ({
  visible = false,
  onClose,
  onSent,
  mode = "compose", // compose, reply, forward
  originalEmail = null,
  replyAll = false,
  title = "Tulis Email Baru",
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("compose");
  const [recipients, setRecipients] = useState({ to: [], cc: [], bcc: [] });
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [isMarkdown, setIsMarkdown] = useState(false);

  const {
    data: { user },
  } = useSession();

  const sendEmail = useSendEmail();
  const saveDraft = useSaveDraft();

  // ✅ FIXED: Initialize form based on mode
  useEffect(() => {
    if (mode === "reply" && originalEmail) {
      // Tentukan penerima berdasarkan mode reply
      let toRecipients = [];

      if (replyAll) {
        // Jika reply all, sertakan semua penerima asli (to + cc) kecuali pengirim saat ini
        const allOriginalRecipients = [
          ...(originalEmail.recipients?.to || []),
          ...(originalEmail.recipients?.cc || []),
        ]
          ?.map((r) => ({
            label: r.user?.username || r.recipient_name || "Unknown",
            value: r.user?.custom_id || r.recipient_id,
          }))
          .filter((r) => r.value !== user?.id);

        // Tambahkan pengirim asli ke daftar penerima
        toRecipients = [
          {
            label:
              originalEmail.sender?.username || originalEmail.sender?.email,
            value: originalEmail.sender_id,
          },
          ...allOriginalRecipients,
        ];
      } else {
        // jika dia ada parent maka kirim ke sender parent
        if (originalEmail?.parent_id) {
          toRecipients = [
            {
              label:
                originalEmail.parent?.sender?.username ||
                originalEmail.parent?.sender?.email,
              value: originalEmail.parent?.sender_id,
            },
          ];
        } else {
          // Jika reply biasa, hanya balas ke pengirim asli
          toRecipients = [
            {
              label:
                originalEmail.sender?.username || originalEmail.sender?.email,
              value: originalEmail.sender_id,
            },
          ];
        }
      }

      // Set penerima email
      setRecipients({
        to: toRecipients,
        cc: [],
        bcc: [],
      });

      // Set subjek email dengan prefix "Re:" jika belum ada
      form.setFieldsValue({
        subject: originalEmail.subject.startsWith("Re: ")
          ? originalEmail.subject
          : `Re: ${originalEmail.subject}`,
      });
    } else if (mode === "forward" && originalEmail) {
      form.setFieldsValue({
        subject: originalEmail.subject.startsWith("Fwd: ")
          ? originalEmail.subject
          : `Fwd: ${originalEmail.subject}`,
      });

      setMessageContent(
        `\n\n--- Pesan Diteruskan ---\nDari: ${
          originalEmail.sender?.username
        }\nTanggal: ${dayjs(originalEmail.created_at).format(
          "DD MMMM YYYY HH:mm"
        )}\nSubjek: ${originalEmail.subject}\n\n${originalEmail.content}`
      );

      // ✅ FIXED: Set attachments dengan format yang benar
      if (originalEmail.attachments && originalEmail.attachments.length > 0) {
        setAttachments([...originalEmail.attachments]);
      }
    } else if (mode === "draft" && originalEmail) {
      const toRecipient =
        originalEmail.recipients?.to?.map((r) => ({
          label: r.user?.username || r.recipient_name || "Unknown",
          value: r.user?.custom_id || r.recipient_id,
        })) || [];

      const ccRecipient =
        originalEmail.recipients?.cc?.map((r) => ({
          label: r.user?.username || r.recipient_name || "Unknown",
          value: r.user?.custom_id || r.recipient_id,
        })) || [];

      const bccRecipient =
        originalEmail.recipients?.bcc?.map((r) => ({
          label: r.user?.username || r.recipient_name || "Unknown",
          value: r.user?.custom_id || r.recipient_id,
        })) || [];

      setRecipients({
        to: toRecipient,
        cc: ccRecipient,
        bcc: bccRecipient,
      });

      form.setFieldsValue({
        subject: originalEmail.subject,
        content: originalEmail.content,
        priority: originalEmail.priority,
      });

      // ✅ FIXED: Set content dan attachments
      setMessageContent(originalEmail.content || "");
      if (originalEmail.attachments && originalEmail.attachments.length > 0) {
        setAttachments([...originalEmail.attachments]);
      }
    }
  }, [mode, originalEmail, replyAll, form, user?.id]);

  // ✅ FIXED: Handle attachments change dengan logging yang lebih detail
  const handleAttachmentsChange = (newAttachments) => {
    console.group("📎 COMPOSE_MODAL - Attachments Changed");
    console.log("Previous count:", attachments.length);
    console.log("New count:", newAttachments.length);
    console.log("Previous attachments:", attachments);
    console.log("New attachments:", newAttachments);
    console.groupEnd();

    // ✅ SAFETY: Ensure we always have an array
    const safeAttachments = Array.isArray(newAttachments) ? newAttachments : [];
    setAttachments(safeAttachments);
  };

  const handleSend = async (values) => {
    if (recipients.to.length === 0) {
      message.error("Mohon tambahkan minimal satu penerima");
      return;
    }

    try {
      // ✅ FIXED: Use the safe attachment ID extractor
      const attachmentIds = extractAttachmentIds(attachments);

      const payload = {
        ...values,
        content: messageContent,
        recipients: {
          to: recipients.to.map((r) => r.value),
          cc: recipients.cc.map((r) => r.value),
          bcc: recipients.bcc.map((r) => r.value),
        },
        attachments: attachmentIds,
        type: "personal",
        parentId:
          mode === "reply" || mode === "forward" ? originalEmail?.id : null,
      };

      debugUploadState.logFormSubmit(payload);

      await sendEmail.mutateAsync(payload);
      message.success("Email berhasil dikirim!");
      handleClose();
      onSent?.();
    } catch (error) {
      console.error("Send email error:", error);
      message.error("Gagal mengirim email");
    }
  };

  const handleSaveDraft = async () => {
    const values = form.getFieldsValue();

    try {
      // ✅ FIXED: Use the safe attachment ID extractor
      const attachmentIds = extractAttachmentIds(attachments);

      const payload = {
        id: originalEmail?.id || null,
        ...values,
        content: messageContent,
        recipients: {
          to: recipients.to.map((r) => r.value),
          cc: recipients.cc.map((r) => r.value),
          bcc: recipients.bcc.map((r) => r.value),
        },
        attachments: attachmentIds,
      };

      debugUploadState.logFormSubmit(payload);

      await saveDraft.mutateAsync(payload);
      onClose?.();
      message.success("Draft tersimpan");
    } catch (error) {
      console.error("Save draft error:", error);
      message.error("Gagal menyimpan draft");
    }
  };

  // ✅ FIXED: Handle close dengan reset yang lebih robust
  const handleClose = () => {
    console.group("📎 COMPOSE_MODAL - Closing and Resetting");
    console.log("Resetting attachments from:", attachments.length);
    console.groupEnd();

    form.resetFields();
    setRecipients({ to: [], cc: [], bcc: [] });
    setAttachments([]); // ✅ Force reset to empty array
    setMessageContent("");
    setActiveTab("compose");
    setShowCc(false);
    setShowBcc(false);
    setIsMarkdown(false);
    onClose?.();
  };

  // Modern modal title with status indicators
  const modalTitle = (
    <div style={{ padding: "0 4px" }}>
      {/* Main Title Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#262626" }}>
            {title}
          </span>
          {mode !== "compose" && (
            <Badge
              count={
                mode === "reply"
                  ? "Reply"
                  : mode === "forward"
                  ? "Forward"
                  : "Draft"
              }
              style={{
                backgroundColor:
                  mode === "reply"
                    ? "#52c41a"
                    : mode === "forward"
                    ? "#1677ff"
                    : "#faad14",
                fontSize: "10px",
                fontWeight: 500,
                borderRadius: "8px",
              }}
            />
          )}
        </div>
      </div>

      {/* Attachment Badge Row */}
      {attachments.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Badge
            count={attachments.length}
            style={{
              backgroundColor: "#1677ff",
              fontSize: "10px",
              fontWeight: 500,
            }}
          >
            <span
              style={{ fontSize: "12px", color: "#8c8c8c", fontWeight: 500 }}
            >
              📎 {attachments.length} file terlampir
            </span>
          </Badge>
        </div>
      )}
    </div>
  );

  // Modern compose content with better spacing
  const composeContent = (
    <div style={{ padding: "8px 0", minHeight: "50vh" }}>
      <Card
        size="small"
        style={{
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          height: "100%",
        }}
        bodyStyle={{
          padding: "24px",
          background: "#ffffff",
          height: "100%",
          overflow: "visible",
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSend}
          initialValues={{
            priority: "normal",
          }}
          style={{ height: "100%" }}
        >
          {/* Recipients Section */}
          <div style={{ marginBottom: "24px" }}>
            <RecipientSelector
              recipients={recipients}
              onChange={setRecipients}
              showCc={showCc}
              showBcc={showBcc}
              onToggleCc={() => setShowCc(true)}
              onToggleBcc={() => setShowBcc(true)}
            />
          </div>

          <Divider style={{ margin: "24px 0", borderColor: "#f0f0f0" }} />

          {/* Subject and Priority Section */}
          <div style={{ marginBottom: "24px" }}>
            <Row gutter={16}>
              <Col xs={24} md={18}>
                <Form.Item
                  name="subject"
                  label={
                    <span
                      style={{
                        fontWeight: 500,
                        color: "#262626",
                        fontSize: "14px",
                      }}
                    >
                      Subjek
                    </span>
                  }
                  rules={[
                    { required: true, message: "Mohon isi subjek email" },
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    placeholder="Tulis subjek email..."
                    size="large"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e8e8e8",
                      fontSize: "15px",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  name="priority"
                  label={
                    <span
                      style={{
                        fontWeight: 500,
                        color: "#262626",
                        fontSize: "14px",
                      }}
                    >
                      Prioritas
                    </span>
                  }
                  style={{ marginBottom: 0 }}
                >
                  <Select size="large" style={{ borderRadius: "8px" }}>
                    <Select.Option value="low">🟢 Rendah</Select.Option>
                    <Select.Option value="normal">🟡 Normal</Select.Option>
                    <Select.Option value="high">🔴 Tinggi</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: "24px 0", borderColor: "#f0f0f0" }} />

          {/* Message Content Section */}
          <div style={{ marginBottom: "24px", flex: 1 }}>
            <div style={{ marginBottom: "12px" }}>
              <span
                style={{ fontSize: "14px", fontWeight: 500, color: "#262626" }}
              >
                Isi Pesan
              </span>
            </div>
            <EmailEditor
              content={messageContent}
              onChange={setMessageContent}
              isMarkdown={isMarkdown}
              onToggleMarkdown={setIsMarkdown}
              rows={10}
            />
          </div>

          {/* Attachments Section */}
          <Divider style={{ margin: "24px 0", borderColor: "#f0f0f0" }} />
          <div style={{ paddingBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <span
                style={{ fontSize: "14px", fontWeight: 500, color: "#262626" }}
              >
                📎 Lampiran
              </span>
              {attachments.length > 0 && (
                <Badge
                  count={attachments.length}
                  style={{
                    backgroundColor: "#1677ff",
                    fontSize: "10px",
                    fontWeight: 500,
                  }}
                />
              )}
            </div>
            <AttachmentUploader
              attachments={attachments}
              onChange={handleAttachmentsChange}
              maxFiles={10}
              maxSize={25}
              multiple={true}
              disabled={sendEmail.isLoading || saveDraft.isLoading}
            />
          </div>
        </Form>
      </Card>
    </div>
  );

  // Modern tab items with better icons and styling
  const tabItems = [
    {
      key: "compose",
      label: (
        <Space>
          <span>✍️</span>
          <span style={{ fontWeight: 500 }}>Tulis</span>
        </Space>
      ),
      children: composeContent,
    },
    {
      key: "preview",
      label: (
        <Space>
          <EyeOutlined />
          <span style={{ fontWeight: 500 }}>Preview</span>
        </Space>
      ),
      children: (
        <div
          style={{
            padding: "8px 0",
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <EmailPreview
            subject={form.getFieldValue("subject")}
            recipients={recipients}
            content={messageContent}
            attachments={attachments}
            isMarkdown={isMarkdown}
          />
        </div>
      ),
    },
  ];

  // Modern footer buttons
  const footerButtons = [
    <Button
      key="draft"
      icon={<SaveOutlined />}
      onClick={handleSaveDraft}
      loading={saveDraft.isLoading}
      disabled={sendEmail.isLoading}
      style={{
        borderRadius: "8px",
        height: "36px",
        fontWeight: 500,
        border: "1px solid #e8e8e8",
      }}
    >
      Simpan Draft
    </Button>,
    <Button
      key="cancel"
      onClick={handleClose}
      disabled={sendEmail.isLoading || saveDraft.isLoading}
      style={{
        borderRadius: "8px",
        height: "36px",
        fontWeight: 500,
        border: "1px solid #e8e8e8",
      }}
    >
      Batal
    </Button>,
    <Button
      key="send"
      type="primary"
      icon={<SendOutlined />}
      onClick={() => form.submit()}
      loading={sendEmail.isLoading}
      disabled={saveDraft.isLoading}
      style={{
        borderRadius: "8px",
        height: "36px",
        fontWeight: 500,
        background: "linear-gradient(135deg, #1677ff 0%, #69c0ff 100%)",
        border: "none",
        boxShadow: "0 2px 8px rgba(22, 119, 255, 0.3)",
      }}
    >
      Kirim Email
    </Button>,
  ];

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={handleClose}
      width={900}
      destroyOnClose={true}
      maskClosable={false}
      style={{
        top: 20,
        paddingBottom: 20,
      }}
      styles={{
        header: {
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: "16px",
          paddingTop: "16px",
          background: "#ffffff",
          borderRadius: "12px 12px 0 0",
        },
        body: {
          padding: "24px",
          maxHeight: "calc(100vh - 300px)",
          minHeight: "50vh",
          overflowY: "auto",
          background: "#ffffff",
          // Custom scrollbar styling
          scrollbarWidth: "thin",
          scrollbarColor: "#d4d4d4 #f8f8f8",
        },
        footer: {
          borderTop: "1px solid #f0f0f0",
          paddingTop: "16px",
          background: "#ffffff",
          borderRadius: "0 0 12px 12px",
        },
        // Custom webkit scrollbar for better browsers
        content: {
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
        },
      }}
      footer={footerButtons}
    >
      <style jsx>{`
        .ant-modal-body::-webkit-scrollbar {
          width: 8px;
        }
        .ant-modal-body::-webkit-scrollbar-track {
          background: #f8f8f8;
          border-radius: 4px;
        }
        .ant-modal-body::-webkit-scrollbar-thumb {
          background: #d4d4d4;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        .ant-modal-body::-webkit-scrollbar-thumb:hover {
          background: #b8b8b8;
        }
        .ant-modal-body {
          scroll-behavior: smooth;
        }
      `}</style>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "0",
          border: "none",
          minHeight: "calc(60vh - 100px)",
        }}
        tabBarStyle={{
          borderBottom: "1px solid #f0f0f0",
          marginBottom: "0",
          paddingBottom: "12px",
          paddingLeft: "4px",
          paddingRight: "4px",
          background: "#ffffff",
          borderRadius: "12px 12px 0 0",
        }}
      />
    </Modal>
  );
};

export default ComposeModal;

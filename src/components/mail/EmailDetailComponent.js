import {
  useDeleteEmail,
  useEmailById,
  useMarkAsRead,
  useToggleStar,
} from "@/hooks/useEmails";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FlagOutlined,
  MoreOutlined,
  PaperClipOutlined,
  PrinterOutlined,
  SendOutlined,
  ShareAltOutlined,
  StarFilled,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Col,
  Dropdown,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";

const { Title, Text, Paragraph } = Typography;

// 1. Simple Header Component
const SimpleHeader = ({ email, onBack, onStar, onDelete, starMutation }) => {
  const moreActions = [
    {
      key: "print",
      label: "Cetak",
      icon: <PrinterOutlined />,
      onClick: () => window.print(),
    },
    {
      key: "spam",
      label: "Tandai sebagai spam",
      icon: <FlagOutlined />,
      danger: true,
    },
    {
      key: "delete",
      label: "Hapus",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: onDelete,
    },
  ];

  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid #f0f0f0",
        backgroundColor: "#fff",
        width: "100%",
      }}
    >
      <Row justify="space-between" align="middle">
        <Col xs={12} sm={8} md={6}>
          <Space size={4}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              type="text"
              size="small"
            />
            <Button
              icon={
                email?.is_starred ? (
                  <StarFilled style={{ color: "#faad14" }} />
                ) : (
                  <StarOutlined />
                )
              }
              onClick={onStar}
              loading={starMutation?.isLoading}
              type="text"
              size="small"
            />
            <Dropdown
              menu={{ items: moreActions }}
              trigger={["click"]}
              placement="bottomLeft"
            >
              <Button icon={<MoreOutlined />} type="text" size="small" />
            </Dropdown>
          </Space>
        </Col>
        <Col xs={12} sm={16} md={18} style={{ textAlign: "right" }}>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {dayjs(email?.created_at).format("MMM D, h:mm A")}
          </Text>
        </Col>
      </Row>
    </div>
  );
};

// 2. Simple Subject Component
const SimpleSubject = ({ subject, priority }) => {
  return (
    <div
      style={{
        padding: "16px 8px 8px 8px",
      }}
    >
      <Title
        level={3}
        style={{
          margin: 0,
          fontSize: "clamp(18px, 4vw, 24px)",
          fontWeight: 400,
          lineHeight: "1.3",
          wordBreak: "break-word",
        }}
      >
        {subject || "(no subject)"}
      </Title>
      {priority && priority !== "normal" && (
        <Tag
          color={priority === "high" ? "red" : "blue"}
          size="small"
          style={{ marginTop: "8px" }}
        >
          {priority === "high" ? "High priority" : "Low priority"}
        </Tag>
      )}
    </div>
  );
};

// 3. Simple Sender Component
const SimpleSender = ({ sender }) => {
  return (
    <div
      style={{
        padding: "0 8px 16px 8px",
      }}
    >
      <Row gutter={12} align="middle">
        <Col xs={24} sm={24}>
          <Space size={12} style={{ width: "100%" }}>
            <Avatar
              src={sender?.image}
              icon={<UserOutlined />}
              size={32}
              style={{ backgroundColor: "#1890ff", flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Text strong style={{ fontSize: "14px" }}>
                    {sender?.username}
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "13px",
                      wordBreak: "break-all",
                    }}
                  >
                    &lt;{sender?.email}&gt;
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  to me
                </Text>
              </div>
            </div>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

// 4. Simple Attachments Component
const SimpleAttachments = ({ attachments, onDownload }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div
      style={{
        padding: "16px 8px",
        borderTop: "1px solid #f0f0f0",
        borderBottom: "1px solid #f0f0f0",
        backgroundColor: "#fafafa",
        margin: "0 -16px",
      }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Text type="secondary" style={{ fontSize: "12px", paddingLeft: "8px" }}>
          {attachments.length} attachment{attachments.length > 1 ? "s" : ""}
        </Text>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              style={{
                padding: "12px",
                backgroundColor: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
              }}
              onClick={() => onDownload(attachment)}
            >
              <Space style={{ flex: 1, minWidth: 0 }}>
                <PaperClipOutlined style={{ color: "#666" }} />
                <div style={{ minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: "13px",
                      display: "block",
                      wordBreak: "break-all",
                    }}
                  >
                    {attachment.file_name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: "11px" }}>
                    {attachment.formatted_size || "Unknown size"}
                  </Text>
                </div>
              </Space>
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                style={{ padding: "4px 8px", flexShrink: 0 }}
              />
            </div>
          ))}
        </div>
      </Space>
    </div>
  );
};

// 5. Simple Content Component
const SimpleContent = ({ content }) => {
  // Fungsi untuk mendeteksi markdown dengan lebih mendalam
  const isMarkdownContent = (text) => {
    if (!text || typeof text !== "string") return false;

    // Pola markdown yang lebih komprehensif
    const markdownPatterns = [
      /\*\*.*?\*\*/, // Bold text
      /\*.*?\*/, // Italic text
      /__.*?__/, // Bold with underscores
      /_.*?_/, // Italic with underscores
      /^#{1,6}\s/m, // Headers
      /```[\s\S]*?```/, // Code blocks
      /`.*?`/, // Inline code
      /^\s*[-*+]\s/m, // Unordered lists
      /^\s*\d+\.\s/m, // Ordered lists
      /^\s*>\s/m, // Blockquotes
      /\[.*?\]\(.*?\)/, // Links
      /!\[.*?\]\(.*?\)/, // Images
      /^\s*\|.*\|/m, // Tables
      /^\s*---+\s*$/m, // Horizontal rules
      /~~.*?~~/, // Strikethrough
      /\n\s*\n/, // Multiple line breaks (markdown formatting)
    ];

    return markdownPatterns.some((pattern) => pattern.test(text));
  };

  return (
    <div
      style={{
        padding: "24px 8px",
        lineHeight: "1.6",
        fontSize: "14px",
        color: "#202124",
        fontFamily: "Arial, sans-serif",
        wordWrap: "break-word",
        overflowWrap: "break-word",
      }}
    >
      {content ? (
        <div>
          {isMarkdownContent(content) ? (
            <>
              <ReactMarkdownCustom withCustom>{content}</ReactMarkdownCustom>
            </>
          ) : (
            <div
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {content}
            </div>
          )}
        </div>
      ) : (
        <Text type="secondary" style={{ fontStyle: "italic" }}>
          Pesan ini tidak memiliki konten
        </Text>
      )}
    </div>
  );
};

// 6. Simple Recipients Component (Minimalist)
const SimpleRecipients = ({ recipients }) => {
  if (!recipients || recipients.length <= 1) return null;

  const toRecipients = recipients.to;
  const ccRecipients = recipients.cc;
  const bccRecipients = recipients.bcc;

  return (
    <div
      style={{
        padding: "12px 8px",
        borderTop: "1px solid #f0f0f0",
        backgroundColor: "#fafafa",
        fontSize: "12px",
        color: "#666",
        margin: "0 -16px",
      }}
    >
      {toRecipients.length > 1 && (
        <div style={{ marginBottom: "4px", wordBreak: "break-all" }}>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            to:{" "}
            {toRecipients
              .map((r) => r.user?.username || r.user?.email)
              .join(", ")}
          </Text>
        </div>
      )}
      {ccRecipients.length > 0 && (
        <div style={{ marginBottom: "4px", wordBreak: "break-all" }}>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            cc:{" "}
            {ccRecipients
              .map((r) => r.user?.username || r.user?.email)
              .join(", ")}
          </Text>
        </div>
      )}
      {bccRecipients.length > 0 && (
        <div style={{ wordBreak: "break-all" }}>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            bcc:{" "}
            {bccRecipients
              .map((r) => r.user?.username || r.user?.email)
              .join(", ")}
          </Text>
        </div>
      )}
    </div>
  );
};

// 7. Simple Actions Component
const SimpleActions = ({ onReply, onForward, onDelete, isDeleting }) => {
  return (
    <div
      style={{
        padding: "16px 8px",
        borderTop: "1px solid #f0f0f0",
        backgroundColor: "#fff",
      }}
    >
      <Row gutter={[8, 8]} justify="start">
        <Col xs={24} sm={12} md={6}>
          <Button
            icon={<SendOutlined />}
            onClick={onReply}
            block
            style={{
              border: "1px solid #dadce0",
              borderRadius: "24px",
              height: "40px",
              fontSize: "14px",
            }}
          >
            Reply
          </Button>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Button
            icon={<ShareAltOutlined />}
            onClick={onForward}
            block
            style={{
              border: "1px solid #dadce0",
              borderRadius: "24px",
              height: "40px",
              fontSize: "14px",
            }}
          >
            Forward
          </Button>
        </Col>
      </Row>
    </div>
  );
};

// Main Component
const EmailDetailComponent = ({ emailId, onBack }) => {
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState(false);

  // Queries
  const {
    data: emailData,
    isLoading,
    isError,
    refetch,
  } = useEmailById(emailId);

  const markReadMutation = useMarkAsRead();
  const starMutation = useToggleStar();
  const deleteMutation = useDeleteEmail();

  const email = emailData?.data;

  // Handlers
  const handleReply = () => {
    router.push(`/mails/compose?reply=${emailId}`);
  };

  const handleForward = () => {
    router.push(`/mails/compose?forward=${emailId}`);
  };

  const handleStar = () => {
    starMutation.mutate(emailId);
  };

  const handleDelete = () => {
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(emailId, {
      onSuccess: () => {
        setDeleteModal(false);
        onBack?.();
        message.success("Email deleted");
      },
    });
  };

  const handleDownloadAttachment = (attachment) => {
    window.open(attachment.file_url, "_blank");
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "48px" }}>
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (isError || !email) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Failed to load email"
          description="Something went wrong while loading the email. Please try again."
          type="error"
          showIcon
          action={
            <Space>
              <Button size="small" onClick={refetch}>
                Retry
              </Button>
              <Button size="small" onClick={onBack}>
                Back
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#fff",
      }}
    >
      {/* Header */}
      <SimpleHeader
        email={email}
        onBack={onBack}
        onStar={handleStar}
        onDelete={handleDelete}
        starMutation={starMutation}
      />

      {/* Content Area */}
      <div
        style={{
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        {/* Subject */}
        <SimpleSubject subject={email.subject} priority={email.priority} />

        {/* Sender */}
        <SimpleSender sender={email.sender} />

        {/* Recipients (if multiple) */}
        <SimpleRecipients recipients={email.recipients} />

        {/* Attachments */}
        <SimpleAttachments
          attachments={email.attachments}
          onDownload={handleDownloadAttachment}
        />

        {/* Content */}
        <SimpleContent content={email.content} />

        {/* Actions */}
        <SimpleActions
          onReply={handleReply}
          onForward={handleForward}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isLoading}
        />
      </div>

      {/* Delete Modal */}
      <Modal
        title="Delete email"
        open={deleteModal}
        onOk={confirmDelete}
        onCancel={() => setDeleteModal(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: deleteMutation.isLoading,
        }}
      >
        <p>
          Are you sure you want to delete &quot;{email.subject || "no subject"}
          &quot;?
        </p>
      </Modal>
    </div>
  );
};

export default EmailDetailComponent;

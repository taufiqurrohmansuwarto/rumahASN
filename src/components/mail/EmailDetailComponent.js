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
  ForwardOutlined,
  MoreOutlined,
  PaperClipOutlined,
  PrinterOutlined,
  SendOutlined,
  StarFilled,
  StarOutlined,
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  Empty,
  Layout,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
  Card,
  Row,
  Col,
  Affix,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const EmailDetailComponent = ({ emailId, onBack }) => {
  const router = useRouter();

  // Hooks
  const {
    data: emailData,
    isLoading,
    isError,
    refetch,
  } = useEmailById(emailId);

  const markReadMutation = useMarkAsRead();
  const starMutation = useToggleStar();
  const deleteMutation = useDeleteEmail();

  // Auto mark as read when email loads
  useState(() => {
    if (emailData?.data && !emailData.data.is_read) {
      markReadMutation.mutate(emailId);
    }
  }, [emailData]);

  // Handlers
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleReply = () => {
    router.push(`/mails/compose?reply=${emailId}`);
  };

  const handleReplyAll = () => {
    router.push(`/mails/compose?reply=${emailId}&all=true`);
  };

  const handleForward = () => {
    router.push(`/mails/compose?forward=${emailId}`);
  };

  const handleStar = () => {
    starMutation.mutate(emailId);
  };

  const handleDelete = () => {
    deleteMutation.mutate(emailId, {
      onSuccess: () => {
        message.success("Email berhasil dihapus");
        handleBack();
      },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadAttachment = (attachment) => {
    const link = document.createElement("a");
    link.href = attachment.file_url;
    link.download = attachment.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Spin size="large" />
          <Text type="secondary">Memuat email...</Text>
        </Content>
      </Layout>
    );
  }

  // Error state
  if (isError || !emailData?.success) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "24px",
          }}
        >
          <Empty
            description="Gagal memuat email atau email tidak ditemukan"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Space>
              <Button onClick={refetch}>Coba Lagi</Button>
              <Button type="primary" onClick={handleBack}>
                Kembali
              </Button>
            </Space>
          </Empty>
        </Content>
      </Layout>
    );
  }

  const email = emailData.data;
  const attachments = email.attachments || [];
  const recipients = email.recipients || [];

  // Group recipients by type
  const toRecipients = recipients.filter((r) => r.type === "to");
  const ccRecipients = recipients.filter((r) => r.type === "cc");
  const bccRecipients = recipients.filter((r) => r.type === "bcc");

  // Format date
  const formatDate = (date) => {
    const emailDate = dayjs(date);
    const now = dayjs();

    if (now.diff(emailDate, "day") === 0) {
      return `Hari ini, ${emailDate.format("HH:mm")}`;
    } else if (now.diff(emailDate, "day") === 1) {
      return `Kemarin, ${emailDate.format("HH:mm")}`;
    } else if (now.year() === emailDate.year()) {
      return emailDate.format("DD MMMM, HH:mm");
    } else {
      return emailDate.format("DD MMMM YYYY, HH:mm");
    }
  };

  // More actions menu
  const moreActions = [
    {
      key: "mark-unread",
      label: "Tandai belum dibaca",
      onClick: () => message.info("Fitur akan segera tersedia"),
    },
    {
      key: "archive",
      label: "Arsipkan",
      onClick: () => message.info("Fitur akan segera tersedia"),
    },
    {
      key: "spam",
      label: "Laporkan sebagai spam",
      onClick: () => message.info("Fitur akan segera tersedia"),
    },
    {
      type: "divider",
    },
    {
      key: "source",
      label: "Lihat sumber asli",
      onClick: () => message.info("Fitur akan segera tersedia"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      {/* Sticky Header */}
      <Affix offsetTop={0}>
        <Header
          style={{
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #f0f0f0",
            padding: "0 24px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left side - Back button and title */}
          <Space size="large">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              type="text"
              size="large"
            >
              Kembali
            </Button>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <MailOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
              <Title level={4} style={{ margin: 0, color: "#262626" }}>
                Detail Email
              </Title>
            </div>
          </Space>

          {/* Right side - Primary actions */}
          <Space>
            <Tooltip
              title={email.is_starred ? "Hapus dari favorit" : "Tandai favorit"}
            >
              <Button
                icon={
                  email.is_starred ? (
                    <StarFilled style={{ color: "#faad14" }} />
                  ) : (
                    <StarOutlined />
                  )
                }
                onClick={handleStar}
                loading={starMutation.isLoading}
                size="large"
              />
            </Tooltip>

            <Button
              icon={<SendOutlined />}
              onClick={handleReply}
              type="primary"
              size="large"
            >
              Balas
            </Button>

            <Dropdown menu={{ items: moreActions }} trigger={["click"]}>
              <Button icon={<MoreOutlined />} size="large" />
            </Dropdown>
          </Space>
        </Header>
      </Affix>

      {/* Main Content */}
      <Content style={{ padding: "0" }}>
        {/* Email Header Section */}
        <div
          style={{
            backgroundColor: "#fafafa",
            borderBottom: "1px solid #f0f0f0",
            padding: "24px 48px",
          }}
        >
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24}>
              {/* Subject */}
              <div style={{ marginBottom: "16px" }}>
                <Title level={2} style={{ margin: 0, marginBottom: "8px" }}>
                  {email.subject || "(Tanpa Subjek)"}
                </Title>
                <Space>
                  {email.priority === "high" && (
                    <Tag color="red">Prioritas Tinggi</Tag>
                  )}
                  {attachments.length > 0 && (
                    <Tag icon={<PaperClipOutlined />} color="blue">
                      {attachments.length} Lampiran
                    </Tag>
                  )}
                </Space>
              </div>

              {/* Sender Info */}
              <Row gutter={[24, 16]} align="middle">
                <Col xs={24} lg={16}>
                  <Space align="start" size="large">
                    <Avatar
                      size={64}
                      src={email.sender?.image}
                      icon={<UserOutlined />}
                      style={{ flexShrink: 0 }}
                    />
                    <Space direction="vertical" size={4}>
                      <Space wrap>
                        <Text strong style={{ fontSize: "18px" }}>
                          {email.sender?.username || email.sender_name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                          {`<${email.sender?.email || "email@example.com"}>`}
                        </Text>
                      </Space>
                      <div>
                        <Text type="secondary">kepada </Text>
                        <Text strong>
                          {toRecipients.length === 1
                            ? "saya"
                            : `${toRecipients.length} penerima`}
                        </Text>
                        {ccRecipients.length > 0 && (
                          <>
                            <Text type="secondary">, cc: </Text>
                            <Text strong>{ccRecipients.length} orang</Text>
                          </>
                        )}
                      </div>
                    </Space>
                  </Space>
                </Col>
                <Col xs={24} lg={8} style={{ textAlign: "right" }}>
                  <Space direction="vertical" align="end" size={4}>
                    <Space>
                      <CalendarOutlined style={{ color: "#8c8c8c" }} />
                      <Text type="secondary" style={{ fontSize: "14px" }}>
                        {formatDate(email.sent_at || email.created_at)}
                      </Text>
                    </Space>
                  </Space>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        {/* Action Bar */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #f0f0f0",
            padding: "16px 48px",
          }}
        >
          <Space wrap size="middle">
            {toRecipients.length > 1 || ccRecipients.length > 0 ? (
              <Button icon={<SendOutlined />} onClick={handleReplyAll}>
                Balas Semua
              </Button>
            ) : null}

            <Button icon={<ForwardOutlined />} onClick={handleForward}>
              Teruskan
            </Button>

            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              Cetak
            </Button>

            <Button
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              danger
              loading={deleteMutation.isLoading}
            >
              Hapus
            </Button>
          </Space>
        </div>

        {/* Email Content */}
        <div style={{ padding: "32px 48px", backgroundColor: "#ffffff" }}>
          <Row justify="center">
            <Col xs={24} xl={16}>
              {/* Main Content */}
              <div
                style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  whiteSpace: "pre-wrap",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  marginBottom: "32px",
                }}
              >
                {email.content ? (
                  email.content.split("\n").map((line, index) => (
                    <Paragraph
                      key={index}
                      style={{ margin: "0 0 16px 0", fontSize: "16px" }}
                    >
                      {line || "\u00A0"}
                    </Paragraph>
                  ))
                ) : (
                  <Text
                    type="secondary"
                    style={{ fontStyle: "italic", fontSize: "16px" }}
                  >
                    Email ini tidak memiliki konten.
                  </Text>
                )}
              </div>

              {/* Attachments */}
              {attachments.length > 0 && (
                <div style={{ marginBottom: "32px" }}>
                  <Divider />
                  <Title level={4} style={{ marginBottom: "24px" }}>
                    <PaperClipOutlined style={{ marginRight: "8px" }} />
                    Lampiran ({attachments.length})
                  </Title>

                  <Row gutter={[16, 16]}>
                    {attachments.map((attachment, index) => (
                      <Col xs={24} sm={12} lg={8} key={index}>
                        <Card
                          size="small"
                          hoverable
                          style={{ borderRadius: "8px" }}
                          actions={[
                            <Tooltip title="Download">
                              <Button
                                type="text"
                                icon={<DownloadOutlined />}
                                onClick={() => downloadAttachment(attachment)}
                                block
                              >
                                Download
                              </Button>
                            </Tooltip>,
                          ]}
                        >
                          <Card.Meta
                            avatar={
                              <PaperClipOutlined
                                style={{ fontSize: "32px", color: "#1890ff" }}
                              />
                            }
                            title={
                              <Text ellipsis style={{ fontSize: "14px" }}>
                                {attachment.file_name}
                              </Text>
                            }
                            description={
                              <Text
                                type="secondary"
                                style={{ fontSize: "13px" }}
                              >
                                {attachment.formatted_size ||
                                  `${Math.round(
                                    attachment.file_size / 1024
                                  )} KB`}
                              </Text>
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* Recipients Details */}
              {(toRecipients.length > 1 ||
                ccRecipients.length > 0 ||
                bccRecipients.length > 0) && (
                <div>
                  <Divider />
                  <Title level={4} style={{ marginBottom: "24px" }}>
                    Detail Penerima
                  </Title>

                  {toRecipients.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <Text
                        strong
                        style={{
                          fontSize: "16px",
                          display: "block",
                          marginBottom: "12px",
                        }}
                      >
                        Kepada:
                      </Text>
                      <Row gutter={[16, 8]}>
                        {toRecipients.map((recipient, index) => (
                          <Col xs={24} sm={12} lg={8} key={index}>
                            <Space align="center" style={{ width: "100%" }}>
                              <Avatar
                                src={recipient.user?.image}
                                icon={<UserOutlined />}
                                size="default"
                              />
                              <div>
                                <Text strong>
                                  {recipient.user?.username ||
                                    recipient.recipient_id}
                                </Text>
                                <br />
                                <Text
                                  type="secondary"
                                  style={{ fontSize: "13px" }}
                                >
                                  {recipient.user?.email}
                                </Text>
                              </div>
                            </Space>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  {ccRecipients.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <Text
                        strong
                        style={{
                          fontSize: "16px",
                          display: "block",
                          marginBottom: "12px",
                        }}
                      >
                        CC:
                      </Text>
                      <Row gutter={[16, 8]}>
                        {ccRecipients.map((recipient, index) => (
                          <Col xs={24} sm={12} lg={8} key={index}>
                            <Space align="center" style={{ width: "100%" }}>
                              <Avatar
                                src={recipient.user?.image}
                                icon={<UserOutlined />}
                                size="default"
                              />
                              <div>
                                <Text strong>
                                  {recipient.user?.username ||
                                    recipient.recipient_id}
                                </Text>
                                <br />
                                <Text
                                  type="secondary"
                                  style={{ fontSize: "13px" }}
                                >
                                  {recipient.user?.email}
                                </Text>
                              </div>
                            </Space>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </div>
              )}
            </Col>
          </Row>
        </div>

        {/* Bottom Action Bar */}
        <div
          style={{
            backgroundColor: "#fafafa",
            borderTop: "1px solid #f0f0f0",
            padding: "24px 48px",
            textAlign: "center",
          }}
        >
          <Space size="large">
            <Button
              type="primary"
              icon={<SendOutlined />}
              size="large"
              onClick={handleReply}
            >
              Balas Email
            </Button>

            {toRecipients.length > 1 || ccRecipients.length > 0 ? (
              <Button
                icon={<SendOutlined />}
                size="large"
                onClick={handleReplyAll}
              >
                Balas Semua
              </Button>
            ) : null}

            <Button
              icon={<ForwardOutlined />}
              size="large"
              onClick={handleForward}
            >
              Teruskan
            </Button>
          </Space>
        </div>
      </Content>
    </Layout>
  );
};

export default EmailDetailComponent;

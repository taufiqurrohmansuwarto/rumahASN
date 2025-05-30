// src/components/mail/Detail/EmailThreadComponent.js
import {
  DownOutlined,
  MoreOutlined,
  SendOutlined,
  UpOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Collapse,
  Divider,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import EmailAttachmentsDisplay from "./EmailAttachmentsDisplay";
import EmailContentDisplay from "./EmailContentDisplay";

const { Text, Title } = Typography;
const { Panel } = Collapse;

// Single email in thread
const ThreadEmailItem = ({
  email,
  isCurrentEmail,
  isLatest,
  onReply,
  onReplyAll,
}) => {
  const [expanded, setExpanded] = useState(isCurrentEmail || isLatest);

  const formatTime = (date) => {
    return dayjs(date).format("DD MMM YYYY, HH:mm");
  };

  const getRecipientSummary = () => {
    const toCount = email.recipients?.to?.length || 0;
    const ccCount = email.recipients?.cc?.length || 0;

    if (toCount === 0) return "No recipients";
    if (toCount === 1 && ccCount === 0) {
      return `to ${email.recipients.to[0]?.user?.username || "Unknown"}`;
    }

    let summary = `to ${toCount} recipient${toCount > 1 ? "s" : ""}`;
    if (ccCount > 0) {
      summary += `, cc ${ccCount}`;
    }
    return summary;
  };

  return (
    <Card
      size="small"
      style={{
        marginBottom: "8px",
        border: isCurrentEmail ? "2px solid #1890ff" : "1px solid #f0f0f0",
        borderRadius: "8px",
      }}
    >
      {/* Email Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          padding: "8px 0",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            src={email.sender?.image}
            icon={<UserOutlined />}
            size="default"
          />

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Text strong style={{ fontSize: "14px" }}>
                {email.sender?.username || "Unknown Sender"}
              </Text>
              {isCurrentEmail && (
                <Tag color="blue" size="small">
                  Current
                </Tag>
              )}
              {!email.is_read && <Badge dot status="processing" />}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "2px",
              }}
            >
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {getRecipientSummary()}
              </Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                • {formatTime(email.created_at)}
              </Text>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {email.attachments?.length > 0 && (
            <Tag size="small">
              {email.attachments.length} attachment
              {email.attachments.length > 1 ? "s" : ""}
            </Tag>
          )}

          <Button
            type="text"
            size="small"
            icon={expanded ? <UpOutlined /> : <DownOutlined />}
          />
        </div>
      </div>

      {/* Email Content (when expanded) */}
      {expanded && (
        <>
          <Divider style={{ margin: "12px 0" }} />

          {/* Subject (if different from thread subject) */}
          {email.subject && (
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ fontSize: "16px" }}>
                {email.subject}
              </Text>
            </div>
          )}

          {/* Content */}
          <EmailContentDisplay content={email.content} isMarkdown={false} />

          {/* Attachments */}
          {email.attachments?.length > 0 && (
            <EmailAttachmentsDisplay attachments={email.attachments} />
          )}

          {/* Action Buttons */}
          <div
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              gap: "8px",
            }}
          >
            <Button
              size="small"
              icon={<SendOutlined />}
              onClick={() => onReply?.(email)}
            >
              Reply
            </Button>

            <Button size="small" onClick={() => onReplyAll?.(email)}>
              Reply All
            </Button>

            <Button size="small" icon={<MoreOutlined />}>
              More
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

// Main thread component
const EmailThreadComponent = ({ emailId, threadData, onReply, onReplyAll }) => {
  if (!threadData || !threadData.thread_emails) {
    return null;
  }

  const { thread_emails, current_email_id, thread_count, thread_subject } =
    threadData;

  // Flatten thread structure untuk display
  const flattenThread = (emails) => {
    const flattened = [];

    const processEmail = (email) => {
      flattened.push(email);
      if (email.replies && email.replies.length > 0) {
        email.replies.forEach(processEmail);
      }
    };

    emails.forEach(processEmail);
    return flattened.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  };

  const flatEmails = flattenThread(thread_emails);

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Thread Header */}
      {thread_count > 1 && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
            border: "1px solid #e8e8e8",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Title level={5} style={{ margin: 0 }}>
              Conversation ({thread_count} messages)
            </Title>
            <Tag color="blue" size="small">
              Thread
            </Tag>
          </div>

          {thread_subject && (
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Subject: {thread_subject}
            </Text>
          )}
        </div>
      )}

      {/* Thread Emails */}
      <div style={{ maxHeight: "600px", overflowY: "auto" }}>
        {flatEmails.map((email, index) => (
          <ThreadEmailItem
            key={email.id}
            email={email}
            isCurrentEmail={email.id === current_email_id}
            isLatest={index === flatEmails.length - 1}
            onReply={onReply}
            onReplyAll={onReplyAll}
          />
        ))}
      </div>
    </div>
  );
};

export default EmailThreadComponent;

// src/components/mail/Detail/EmailThreadComponent.js
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Collapse,
  message,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useState } from "react";
import EmailActionButtons from "./EmailActionButtons";
import EmailAttachmentsDisplay from "./EmailAttachmentsDisplay";
import EmailContentDisplay from "./EmailContentDisplay";
import EmailDetailHeader from "./EmailDetailHeader";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  useDeleteEmail,
  useMarkAsRead,
  useMarkAsUnread,
  useMoveToFolder,
  useToggleStar,
  useUpdatePriority,
} from "@/hooks/useEmails";

const { Text, Title } = Typography;
const { Panel } = Collapse;

// Single email in thread
const ThreadEmailItem = ({
  email,
  isCurrentEmail,
  isLatest,
  onReply,
  onReplyAll,
  onForward,
  threadEmails,
  currentIndex,
}) => {
  // action
  const toggleStarMutation = useToggleStar();
  const deleteEmailMutation = useDeleteEmail();
  const moveToFolderMutation = useMoveToFolder();
  const markAsUnreadMutation = useMarkAsUnread();
  const markAsReadMutation = useMarkAsRead();
  const updatePriorityMutation = useUpdatePriority();

  const [expanded, setExpanded] = useState(true);

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

  // Function to check if current email is a reply
  const isReplyEmail = () => {
    // Email dianggap reply jika:
    // 1. Memiliki parent_id
    // 2. Memiliki in_reply_to
    // 3. Memiliki references
    // 4. Subject dimulai dengan "Re:" atau "RE:"
    // 5. Bukan email pertama dalam thread dan memiliki pattern quoted text

    // 1. Cek parent_id
    if (email.parent_id) return true;

    // 2. Cek in_reply_to
    if (email.in_reply_to) return true;

    // 3. Cek references
    if (
      email.references &&
      (Array.isArray(email.references)
        ? email.references.length > 0
        : email.references)
    ) {
      return true;
    }

    // 4. Cek subject dengan "Re:"
    const subject = email.subject || "";
    if (subject.toLowerCase().includes("re:")) return true;

    // 5. Cek content dengan quoted text pattern (hanya jika bukan email pertama)
    if (currentIndex > 0) {
      const content = email.content || "";
      if (content.match(/(Pada .+? menulis:|On .+? wrote:)/)) return true;
    }

    return false;
  };

  // Function to get quoted content from previous messages
  const getQuotedContent = () => {
    if (currentIndex === 0) return ""; // First email has no previous messages

    // Cari email parent berdasarkan parent_id, in_reply_to, atau references
    let parentEmail = null;

    // 1. Coba cari berdasarkan parent_id jika ada
    if (email.parent_id) {
      parentEmail = threadEmails.find((e) => e.id === email.parent_id);
    }

    // 2. Coba cari berdasarkan in_reply_to jika ada
    if (!parentEmail && email.in_reply_to) {
      parentEmail = threadEmails.find((e) => e.id === email.in_reply_to);
    }

    // 3. Coba cari berdasarkan references jika ada
    if (!parentEmail && email.references) {
      // references biasanya array atau string yang berisi ID email sebelumnya
      const refs = Array.isArray(email.references)
        ? email.references
        : [email.references];
      for (const ref of refs) {
        parentEmail = threadEmails.find((e) => e.id === ref);
        if (parentEmail) break;
      }
    }

    // 4. Fallback: ambil email tepat sebelumnya dalam urutan kronologis
    if (!parentEmail && currentIndex > 0) {
      parentEmail = threadEmails[currentIndex - 1];
    }

    if (!parentEmail) return "";

    const senderName = parentEmail.sender?.username || "Unknown Sender";
    const senderEmail = parentEmail.sender?.email || "unknown@email.com";
    // Format tanggal menggunakan locale Indonesia
    const formattedDate = dayjs(parentEmail.created_at)
      .locale("id")
      .format("ddd, DD MMM YYYY [pukul] HH:mm");

    return `Pada ${formattedDate} ${senderName} menulis:

${parentEmail.content || ""}`;
  };

  // Combine current content with quoted content (only for replies)
  const getFullContent = () => {
    const currentContent = email.content || "";

    // Hanya tampilkan quote jika email ini adalah balasan
    if (!isReplyEmail()) {
      return currentContent;
    }

    const quotedContent = getQuotedContent();

    if (!quotedContent) return currentContent;

    return `${currentContent}

${quotedContent}`;
  };

  // Handlers untuk actions (placeholder - bisa disesuaikan dengan kebutuhan)
  const handleToggleStar = async () => {
    try {
      await toggleStarMutation.mutateAsync(email.id);
      message.success("Berhasil mengubah status bintang");
    } catch (error) {
      message.error("Gagal mengubah status bintang");
    }
  };

  const handleUpdatePriority = async (priority) => {
    try {
      await updatePriorityMutation.mutateAsync({
        emailId: email.id,
        priority,
      });
      message.success("Berhasil mengubah prioritas email");
    } catch (error) {
      message.error("Gagal mengubah prioritas email");
    }
  };

  const handleMarkAsUnread = async () => {
    try {
      await markAsUnreadMutation.mutateAsync(email.id);
      message.success("Berhasil mengubah status tidak terbaca");
    } catch (error) {
      message.error("Gagal mengubah status tidak terbaca");
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await markAsReadMutation.mutateAsync(email.id);
      message.success("Berhasil mengubah status terbaca");
    } catch (error) {
      message.error("Gagal mengubah status terbaca");
    }
  };

  const handleMoveToFolder = async (folder) => {
    try {
      await moveToFolderMutation.mutateAsync({
        emailId: email.id,
        folder,
      });
      message.success("Berhasil memindahkan email ke folder");
    } catch (error) {
      message.error("Gagal memindahkan email ke folder");
    }
  };

  const handleReplyAction = (replyAll = false) => {
    if (replyAll) {
      onReplyAll?.(email);
    } else {
      onReply?.(email);
    }
  };

  const handleForward = () => {
    // Implement forward
    onForward?.(email);
  };

  const handleDelete = () => {
    // Implement delete
    console.log("Delete email:", email.id);
  };

  const handleArchive = () => {
    // Implement archive
    console.log("Archive email:", email.id);
  };

  const handleFlag = () => {
    // Implement flag
    console.log("Flag email:", email.id);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card
      style={{
        marginBottom: "16px",
        border: isCurrentEmail ? "2px solid #1890ff" : "1px solid #f0f0f0",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Collapsed Header */}
      {!expanded && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            padding: "12px 16px",
            borderRadius: "8px",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#f8f9fa")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
          onClick={() => setExpanded(true)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar
              src={email.sender?.image}
              icon={<UserOutlined />}
              size="default"
            />

            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
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

            <Button type="text" size="small" icon={<DownOutlined />} />
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: "0" }}>
          {/* Email Header - menggunakan komponen yang sama dengan EmailDetailComponent */}
          <div style={{ padding: "24px 24px 16px 24px" }}>
            <EmailDetailHeader
              email={email}
              onToggleStar={handleToggleStar}
              isStarLoading={false}
              onToggleRead={handleMarkAsRead}
              isReadLoading={false}
              onToggleUnread={handleMarkAsUnread}
              isUnreadLoading={false}
              onMoveToFolder={handleMoveToFolder}
              isMoveToFolderLoading={false}
              recipients={email.recipients}
              onRefresh={() => {}}
              onUpdatePriority={handleUpdatePriority}
              isUpdatePriorityLoading={false}
              showCollapseButton={true}
              onCollapse={() => setExpanded(false)}
            />
          </div>

          {/* Email Content tanpa scroll individual */}
          <div style={{ padding: "0 24px 16px 24px" }}>
            <div
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: "6px",
                padding: "16px",
                backgroundColor: "#fafafa",
              }}
            >
              <EmailContentDisplay
                content={getFullContent()}
                isMarkdown={false}
              />
            </div>
          </div>

          {/* Attachments tanpa scroll individual */}
          {email.attachments && email.attachments.length > 0 && (
            <div style={{ padding: "0 24px 16px 24px" }}>
              <EmailAttachmentsDisplay attachments={email.attachments} />
            </div>
          )}

          {/* Action Buttons - menggunakan komponen yang sama */}
          <div style={{ padding: "0 24px 24px 24px" }}>
            <EmailActionButtons
              email={email}
              onReply={handleReplyAction}
              onReplyAll={() => handleReplyAction(true)}
              onForward={handleForward}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onFlag={handleFlag}
              onPrint={handlePrint}
              loading={{
                delete: false,
                archive: false,
              }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

// Main thread component
const EmailThreadComponent = ({
  emailId,
  threadData,
  onReply,
  onReplyAll,
  onForward,
}) => {
  useScrollRestoration();

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
    <div
      style={{
        marginBottom: "24px",
        maxHeight: "calc(100vh - 200px)", // Beri tinggi maksimal berdasarkan viewport
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Thread Header */}
      {thread_count > 1 && (
        <div
          style={{
            marginBottom: "16px",
            padding: "16px 20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #e8e8e8",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            flexShrink: 0, // Jangan biarkan header menyusut
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
              💬 Percakapan ({thread_count} pesan)
            </Title>
            <Tag color="blue" size="default">
              Thread
            </Tag>
          </div>

          {thread_subject && (
            <Text
              type="secondary"
              style={{ fontSize: "13px", lineHeight: 1.4 }}
            >
              <strong>Subjek:</strong> {thread_subject}
            </Text>
          )}
        </div>
      )}

      {/* Thread Emails Container dengan satu scrolling utama yang dipercantik */}
      <div
        style={{
          flex: 1,
          height: "calc(100vh - 300px)", // Tinggi tetap agar scrolling konsisten
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: "12px",
          paddingLeft: "4px",
          // Smooth scrolling
          scrollBehavior: "smooth",
          // Firefox scrollbar
          scrollbarWidth: "thin",
          scrollbarColor: "#d4d4d4 #f8f9fa",
        }}
        className="email-thread-container"
      >
        {/* CSS untuk styling scrollbar yang lebih cantik */}
        <style jsx>{`
          .email-thread-container::-webkit-scrollbar {
            width: 10px;
          }

          .email-thread-container::-webkit-scrollbar-track {
            background: #f8f9fa;
            border-radius: 12px;
            margin: 8px 0;
          }

          .email-thread-container::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #d4d4d4 0%, #bfbfbf 100%);
            border-radius: 12px;
            border: 2px solid #f8f9fa;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }

          .email-thread-container::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #bfbfbf 0%, #8c8c8c 100%);
            transform: scale(1.1);
          }

          .email-thread-container::-webkit-scrollbar-thumb:active {
            background: linear-gradient(180deg, #8c8c8c 0%, #595959 100%);
          }

          .email-thread-container::-webkit-scrollbar-corner {
            background: #f8f9fa;
          }

          /* Smooth scroll behavior untuk seluruh container */
          .email-thread-container {
            scroll-behavior: smooth;
          }

          /* Efek hover untuk cards saat scrolling */
          .email-thread-container .ant-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .email-thread-container .ant-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }
        `}</style>

        {flatEmails.map((email, index) => (
          <ThreadEmailItem
            key={email.id}
            email={email}
            isCurrentEmail={email.id === current_email_id}
            isLatest={index === flatEmails.length - 1}
            onReply={onReply}
            onReplyAll={onReplyAll}
            onForward={onForward}
            threadEmails={flatEmails}
            currentIndex={index}
          />
        ))}
      </div>
    </div>
  );
};

export default EmailThreadComponent;

import React from "react";
import { Card, Spin, Empty, message } from "antd";
import { useRouter } from "next/router";
import {
  useToggleStar,
  useDeleteEmail,
  useMoveToFolder,
  useMarkAsUnread,
  useMarkAsRead,
} from "@/hooks/useEmails";

// Import komponen kecil
import EmailDetailHeader from "./EmailDetailHeader";
import EmailRecipientsDisplay from "./EmailRecipientsDisplay";
import EmailContentDisplay from "./EmailContentDisplay";
import EmailAttachmentsDisplay from "./EmailAttachmentsDisplay";
import EmailActionButtons from "./EmailActionButtons";

const EmailDetailComponent = ({
  email,
  loading = false,
  error = null,
  onRefresh,
}) => {
  const router = useRouter();

  // Mutations
  const toggleStarMutation = useToggleStar();
  const deleteEmailMutation = useDeleteEmail();
  const moveToFolderMutation = useMoveToFolder();
  const markAsUnreadMutation = useMarkAsUnread();
  const markAsReadMutation = useMarkAsRead();

  // Handlers
  const handleToggleStar = async () => {
    try {
      await toggleStarMutation.mutateAsync(email.id);
      onRefresh?.();
    } catch (error) {
      message.error("Gagal mengubah status bintang");
    }
  };

  const handleMarkAsUnread = async () => {
    try {
      await markAsUnreadMutation.mutateAsync(email.id);
      router.push("/mails/inbox");
    } catch (error) {
      message.error("Gagal menandai email belum dibaca");
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await markAsReadMutation.mutateAsync(email.id);
      onRefresh?.();
    } catch (error) {
      message.error("Gagal menandai email sudah dibaca");
    }
  };

  const handleReply = (replyAll = false) => {
    const queryParams = new URLSearchParams({
      reply: email.id,
      ...(replyAll && { replyAll: "true" }),
    });
    router.push(`/mails/compose?${queryParams.toString()}`);
  };

  const handleForward = () => {
    router.push(`/mails/compose?forward=${email.id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteEmailMutation.mutateAsync(email.id);
      message.success("Email dipindahkan ke trash");
      router.push("/mails/inbox");
    } catch (error) {
      message.error("Gagal menghapus email");
    }
  };

  const handleArchive = async () => {
    try {
      await moveToFolderMutation.mutateAsync({
        emailId: email.id,
        folder: "archive",
      });
      message.success("Email diarsipkan");
      onRefresh?.();
    } catch (error) {
      message.error("Gagal mengarsipkan email");
    }
  };

  const handleFlag = () => {
    // Implement flag functionality if needed
    message.info("Fitur tandai penting belum tersedia");
  };

  const handlePrint = () => {
    window.print();
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
          }}
        >
          <Spin size="large" tip="Memuat email..." />
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <Empty
          description="Gagal memuat email"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  // No email
  if (!email) {
    return (
      <Card>
        <Empty
          description="Email tidak ditemukan"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ padding: "24px 24px 0 24px" }}>
        {/* Email Header */}
        <EmailDetailHeader
          email={email}
          onToggleStar={handleToggleStar}
          isStarLoading={toggleStarMutation.isLoading}
          onToggleRead={handleMarkAsRead}
          isReadLoading={markAsReadMutation.isLoading}
          onToggleUnread={handleMarkAsUnread}
          isUnreadLoading={markAsUnreadMutation.isLoading}
        />

        {/* Recipients */}
        <EmailRecipientsDisplay recipients={email.recipients} />

        {/* Email Content */}
        <EmailContentDisplay
          content={email.content}
          isMarkdown={false} // Detect if markdown needed
        />

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <EmailAttachmentsDisplay attachments={email.attachments} />
        )}
      </div>

      {/* Action Buttons */}
      <EmailActionButtons
        email={email}
        onReply={handleReply}
        onReplyAll={() => handleReply(true)}
        onForward={handleForward}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onFlag={handleFlag}
        onPrint={handlePrint}
        loading={{
          delete: deleteEmailMutation.isLoading,
          archive: moveToFolderMutation.isLoading,
        }}
      />
    </Card>
  );
};

export default EmailDetailComponent;

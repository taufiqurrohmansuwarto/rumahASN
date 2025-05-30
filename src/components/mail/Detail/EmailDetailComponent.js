import {
  useDeleteEmail,
  useMarkAsRead,
  useMarkAsUnread,
  useMoveToFolder,
  useToggleStar,
  useUpdatePriority,
} from "@/hooks/useEmails";
import { Card, Empty, message, Spin } from "antd";
import { useRouter } from "next/router";

// Import komponen kecil
import EmailActionButtons from "./EmailActionButtons";
import EmailAttachmentsDisplay from "./EmailAttachmentsDisplay";
import EmailContentDisplay from "./EmailContentDisplay";
import EmailDetailHeader from "./EmailDetailHeader";

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
  const updatePriorityMutation = useUpdatePriority();

  // Handlers
  const handleToggleStar = async () => {
    try {
      await toggleStarMutation.mutateAsync(email.id);
      onRefresh?.();
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
      message.success(`Berhasil mengubah prioritas email`);
      onRefresh?.();
    } catch (error) {
      message.error("Gagal mengubah prioritas email");
    }
  };

  const handleMarkAsUnread = async () => {
    try {
      await markAsUnreadMutation.mutateAsync(email.id);
      message.success(`Berhasil menandai email belum dibaca`);
    } catch (error) {
      message.error("Gagal menandai email belum dibaca");
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await markAsReadMutation.mutateAsync(email.id);
      message.success(`Berhasil menandai email sudah dibaca`);
      onRefresh?.();
    } catch (error) {
      message.error("Gagal menandai email sudah dibaca");
    }
  };

  const handleMoveToFolder = async (folder) => {
    try {
      await moveToFolderMutation.mutateAsync({
        emailId: email.id,
        folder,
      });
      message.success(`Email dipindahkan ke ${folder}`);
      router.push(`/mails/${folder}`);
      onRefresh?.();
    } catch (error) {
      message.error("Gagal memindahkan email ke folder");
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
      await deleteEmailMutation.mutateAsync({
        emailId: email.id,
        permanent: false,
      });
      message.success("Email dipindahkan ke trash");
      router.push("/mails/trash");
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

  const handleFlag = async () => {
    try {
      await updatePriorityMutation.mutateAsync({
        emailId: email.id,
        priority: "high",
      });
      message.success("Email ditandai sebagai penting");
      onRefresh?.();
    } catch (error) {
      message.error("Gagal menandai email sebagai penting");
    }
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
          onMoveToFolder={handleMoveToFolder}
          isMoveToFolderLoading={moveToFolderMutation.isLoading}
          recipients={email.recipients}
          onRefresh={onRefresh}
          onUpdatePriority={handleUpdatePriority}
          isUpdatePriorityLoading={updatePriorityMutation.isLoading}
        />

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

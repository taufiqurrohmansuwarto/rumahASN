// components/mail/EmailList/EmailListComponent.js
import {
  useBulkDelete,
  useDeleteEmail,
  useInboxEmails,
  useMarkAsNotSpam,
  useMarkAsRead,
  useMarkAsSpam,
  useMarkAsUnread,
  useMoveToFolder,
  useToggleStar,
} from "@/hooks/useEmails";
import { getActionConfig, getFolderConfig } from "@/utils/emailFolderConfig";
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ForwardOutlined,
  InboxOutlined,
  MoreOutlined,
  SendOutlined,
  StarOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Card, List, Pagination, Space, Typography, message } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import EmailListBulkActions from "./EmailListBulkActions";
import EmailListEmpty from "./EmailListEmpty";
import EmailListFilters from "./EmailListFilters";
import EmailListHeader from "./EmailListHeader";
import EmailListItem from "./EmailListItem";
import EmailListModals from "./EmailListModals";
import EmailListSelectAll from "./EmailListSelectAll";
import { useQuery } from "@tanstack/react-query";

const { Text } = Typography;

const EmailListComponent = ({
  folder = "inbox",
  customConfig = {},
  onEmailClick,
  onCompose,
  ...props
}) => {
  const router = useRouter();
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  // Get folder configuration
  const config = { ...getFolderConfig(folder), ...customConfig };

  // Extract query params with defaults
  const { page = 1, limit = 25, search = "", unread = false } = router.query;

  // Parse params to correct types
  const queryParams = {
    page: parseInt(page),
    limit: parseInt(limit),
    search: search.toString(),
    unreadOnly: unread === "true",
    ...config.defaultFilter,
  };

  // Update URL helper
  const updateQuery = (newParams) => {
    const updatedQuery = { ...router.query, ...newParams };

    // Remove empty values
    Object.keys(updatedQuery).forEach((key) => {
      if (
        updatedQuery[key] === "" ||
        updatedQuery[key] === false ||
        updatedQuery[key] === "false"
      ) {
        delete updatedQuery[key];
      }
    });

    router.push(
      {
        pathname: router.pathname,
        query: updatedQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  // Use the appropriate API function based on folder config
  const {
    data: emailsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["emails", folder, queryParams, customConfig?.labelId],
    queryFn: () => {
      if (!config.apiFunction) {
        throw new Error(`API function not implemented for folder: ${folder}`);
      }

      // ✅ PERBAIKAN: Pass folder dan labelId dengan benar
      const params = {
        ...queryParams,
        folder: folder, // ✅ TAMBAHKAN INI - explicit pass folder
      };

      // For label folder, add labelId
      if (folder === "label" && customConfig?.labelId) {
        params.labelId = customConfig.labelId;
      }

      return config.apiFunction(params);
    },
    keepPreviousData: true,
    staleTime: 30000,
  });

  // Mutations
  const markReadMutation = useMarkAsRead();
  const markUnreadMutation = useMarkAsUnread();
  const starMutation = useToggleStar();
  const moveToFolderMutation = useMoveToFolder();
  const bulkDeleteMutation = useBulkDelete();
  const deleteMutation = useDeleteEmail();
  const markAsSpamMutation = useMarkAsSpam();
  const markAsNotSpamMutation = useMarkAsNotSpam();

  // Reset selected emails when query changes
  useEffect(() => {
    setSelectedEmails([]);
  }, [router.query]);

  // Handlers
  const handleEmailClick = async (email) => {
    if (onEmailClick) {
      onEmailClick(email);
      return;
    }

    // Default behavior based on folder config
    if (config.clickAction === "edit") {
      // For drafts - redirect to compose with draft ID
      router.push(`/mails/compose?draft=${email.id}`);
      return;
    }

    // For other folders - mark as read and view detail
    if (config.allowMarkAsRead && !email.is_read) {
      await markReadMutation.mutateAsync(email.id);
    }
    router.push(`/mails/${folder}/${email.id}`);
  };

  const handleStarClick = (e, emailId) => {
    e.stopPropagation();
    starMutation.mutate(emailId);
  };

  const handleSelectEmail = (emailId, checked) => {
    if (checked) {
      setSelectedEmails([...selectedEmails, emailId]);
    } else {
      setSelectedEmails(selectedEmails.filter((id) => id !== emailId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allEmailIds =
        emailsData?.data?.emails?.map((email) => email.id) || [];
      setSelectedEmails(allEmailIds);
    } else {
      setSelectedEmails([]);
    }
  };

  const handleSearch = (value) => {
    updateQuery({ search: value, page: 1 });
  };

  const handleUnreadFilter = (value) => {
    updateQuery({ unread: value, page: 1 });
  };

  const handlePageSizeChange = (value) => {
    updateQuery({ limit: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    updateQuery({ page: newPage });
  };

  const handleBulkDelete = () => {
    if (selectedEmails.length === 0) {
      message.warning("Pilih email yang ingin dihapus");
      return;
    }
    setBulkDeleteModal(true);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedEmails, {
      onSuccess: () => {
        setSelectedEmails([]);
        setBulkDeleteModal(false);
      },
    });
  };

  const handleRefresh = () => {
    refetch();
    message.success(`${config.subtitle} diperbarui`);
  };

  const handleCompose = () => {
    if (onCompose) {
      onCompose();
    } else {
      router.push("/mails/compose");
    }
  };

  // Action handlers based on folder config
  const handleEmailAction = async (action, email) => {
    const actionConfig = getActionConfig(action);

    switch (action) {
      case "star":
        await starMutation.mutateAsync(email.id);
        break;
      case "read":
        if (email.is_read) {
          await markUnreadMutation.mutateAsync(email.id);
        } else {
          await markReadMutation.mutateAsync(email.id);
        }
        break;
      case "archive":
        await moveToFolderMutation.mutateAsync({
          emailId: email.id,
          folder: "archive",
        });
        break;
      case "spam":
        await markAsSpamMutation.mutateAsync(email.id);
        break;
      case "not-spam":
        await markAsNotSpamMutation.mutateAsync(email.id);
        break;
      case "delete":
        await deleteMutation.mutateAsync(email.id);
        break;
      case "restore":
        await moveToFolderMutation.mutateAsync({
          emailId: email.id,
          folder: "inbox",
        });
        break;
      case "reply":
        router.push(`/mails/compose?reply=${email.id}`);
        break;
      case "forward":
        router.push(`/mails/compose?forward=${email.id}`);
        break;
      case "edit":
        router.push(`/mails/compose?draft=${email.id}`);
        break;
      case "inbox":
        await moveToFolderMutation.mutateAsync({
          emailId: email.id,
          folder: "inbox",
        });
        break;
      case "not-spam":
        await moveToFolderMutation.mutateAsync({
          emailId: email.id,
          folder: "inbox",
        });
        break;
      case "unsnooze":
        // TODO: implement unsnooze logic
        message.info("Fitur unsnooze belum tersedia");
        break;
      case "send":
        // TODO: implement send draft logic
        message.info("Fitur kirim draft belum tersedia");
        break;
      case "delete-permanent":
        // TODO: implement permanent delete
        message.info("Fitur hapus permanen belum tersedia");
        break;
      default:
        message.warning(`Aksi ${action} belum diimplementasi`);
    }
  };

  // Get email actions based on folder config
  const getEmailActions = (email) => {
    return config.itemActions
      .map((actionKey) => {
        const actionConfig = getActionConfig(actionKey);
        if (!actionConfig) return null;

        return {
          key: actionKey,
          label: actionConfig.label,
          icon: getActionIcon(actionConfig.icon),
          onClick: () => handleEmailAction(actionKey, email),
          danger: actionConfig.danger || false,
        };
      })
      .filter(Boolean);
  };

  // Helper to get icon component
  const getActionIcon = (iconName) => {
    const icons = {
      StarOutlined: <StarOutlined />,
      EyeOutlined: <EyeOutlined />,
      FolderOutlined: <InboxOutlined />,
      DeleteOutlined: <DeleteOutlined />,
      SendOutlined: <SendOutlined />,
      ForwardOutlined: <ForwardOutlined />,
      EditOutlined: <EditOutlined />,
      UndoOutlined: <UndoOutlined />,
      CheckOutlined: <CheckOutlined />,
      InboxOutlined: <InboxOutlined />,
    };
    return icons[iconName] || <MoreOutlined />;
  };

  // Error state
  if (isError) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <EmailListEmpty
            config={{
              ...config,
              emptyTitle: `Gagal memuat ${config.subtitle.toLowerCase()}`,
              emptyDescription: "Terjadi kesalahan saat memuat data",
              emptyAction: null,
            }}
            onCompose={handleCompose}
          />
        </Card>
      </div>
    );
  }

  const emails = emailsData?.data?.emails || [];
  const total = emailsData?.data?.total || 0;
  const unreadCount = emails.filter((email) => !email.is_read).length;

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <EmailListHeader
        config={config}
        total={total}
        unreadCount={unreadCount}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onCompose={handleCompose}
      />

      {/* Filters */}
      <Card style={{ marginBottom: "16px" }}>
        <EmailListFilters
          config={config}
          queryParams={queryParams}
          onSearch={handleSearch}
          onUnreadFilter={handleUnreadFilter}
          onPageSizeChange={handlePageSizeChange}
        />

        {/* Bulk Actions */}
        <EmailListBulkActions
          config={config}
          selectedEmails={selectedEmails}
          isLoading={bulkDeleteMutation.isLoading}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedEmails([])}
        />
      </Card>

      {/* Email List */}
      <Card loading={isLoading}>
        {emails.length === 0 ? (
          <EmailListEmpty
            config={config}
            hasSearchQuery={Boolean(queryParams.search)}
            searchQuery={queryParams.search}
            onCompose={handleCompose}
          />
        ) : (
          <>
            {/* Select All Header */}
            <EmailListSelectAll
              selectedEmails={selectedEmails}
              totalEmails={emails.length}
              onSelectAll={handleSelectAll}
            />

            {/* Email List */}
            <List
              dataSource={emails}
              renderItem={(email) => (
                <EmailListItem
                  key={email.id}
                  email={email}
                  config={config}
                  isSelected={selectedEmails.includes(email.id)}
                  onEmailClick={handleEmailClick}
                  onSelectEmail={handleSelectEmail}
                  onStarClick={handleStarClick}
                  onActionClick={handleEmailAction}
                  getEmailActions={getEmailActions}
                />
              )}
            />
          </>
        )}
      </Card>

      {/* Pagination */}
      {total > queryParams.limit && (
        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Card>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Text type="secondary">
                Halaman {queryParams.page} dari{" "}
                {Math.ceil(total / queryParams.limit)}
              </Text>
              <Pagination
                current={queryParams.page}
                total={total}
                pageSize={queryParams.limit}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `Menampilkan ${range[0]}-${range[1]} dari ${total} email`
                }
              />
            </Space>
          </Card>
        </div>
      )}

      {/* Modals */}
      <EmailListModals
        folder={folder}
        bulkDeleteModal={bulkDeleteModal}
        selectedEmails={selectedEmails}
        isLoading={bulkDeleteMutation.isLoading}
        onConfirmBulkDelete={confirmBulkDelete}
        onCancelBulkDelete={() => setBulkDeleteModal(false)}
      />
    </div>
  );
};

export default EmailListComponent;

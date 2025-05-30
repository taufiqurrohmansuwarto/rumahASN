// src/components/mail/EmailList/EmailListComponent.js
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileOutlined,
  FilterOutlined,
  FolderOutlined,
  ForwardOutlined,
  InboxOutlined,
  MailOutlined,
  MoreOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
  StarFilled,
  StarOutlined,
  SyncOutlined,
  TagOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Dropdown,
  Empty,
  Input,
  List,
  message,
  Modal,
  Pagination,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// Import hooks
import {
  useArchiveEmail,
  useBulkDelete,
  useDeleteDraft,
  useDeleteEmail,
  useMarkAsNotSpam,
  useMarkAsRead,
  useMarkAsSpam,
  useMarkAsUnread,
  useMoveToFolder,
  useToggleStar,
} from "@/hooks/useEmails";

// Import utilities
import { getFolderConfig } from "@/utils/emailFolderConfig";
import { useSession } from "next-auth/react";

const { Text, Title } = Typography;
const { Search } = Input;

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
  const [searchValue, setSearchValue] = useState("");

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

  // Sync search value dengan URL
  useEffect(() => {
    setSearchValue(queryParams.search);
  }, [queryParams.search]);

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

      const params = {
        ...queryParams,
        folder: folder,
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
  const deleteDraftMutation = useDeleteDraft();
  const markAsSpamMutation = useMarkAsSpam();
  const markAsNotSpamMutation = useMarkAsNotSpam();
  const archiveEmailMutation = useArchiveEmail();

  const {
    data: { user },
  } = useSession();

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
    starMutation.mutate(emailId, {
      onSuccess: () => {
        message.success("Status bintang berhasil diubah");
      },
    });
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

  // Search handlers
  const handleSearch = (value) => {
    updateQuery({ search: value, page: 1 });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // Auto search when cleared
    if (!value) {
      handleSearch("");
    }
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

  // Bulk action handler
  const handleBulkAction = async (actionKey, emailIds, actionData = null) => {
    try {
      switch (actionKey) {
        case "archive":
          await Promise.all(
            emailIds.map((id) => archiveEmailMutation.mutateAsync(id))
          );
          message.success(`${emailIds.length} email berhasil diarsipkan`);
          break;

        case "spam":
          await Promise.all(
            emailIds.map((id) => markAsSpamMutation.mutateAsync(id))
          );
          message.success(`${emailIds.length} email ditandai sebagai spam`);
          break;

        case "not-spam":
          await Promise.all(
            emailIds.map((id) => markAsNotSpamMutation.mutateAsync(id))
          );
          message.success(`${emailIds.length} email dikembalikan dari spam`);
          break;

        case "delete":
          setBulkDeleteModal(true);
          return; // Don't clear selection yet

        case "delete-permanent":
          await Promise.all(
            emailIds.map((id) =>
              deleteMutation.mutateAsync({ emailId: id, permanent: true })
            )
          );
          message.success(`${emailIds.length} email dihapus permanen`);
          break;

        case "discard":
          await Promise.all(
            emailIds.map((id) => deleteDraftMutation.mutateAsync(id))
          );
          message.success(`${emailIds.length} draft berhasil dihapus`);
          break;

        case "mark-read":
          await Promise.all(
            emailIds.map((id) => markReadMutation.mutateAsync(id))
          );
          message.success(`${emailIds.length} email ditandai sudah dibaca`);
          break;

        case "mark-unread":
          await Promise.all(
            emailIds.map((id) => markUnreadMutation.mutateAsync(id))
          );
          message.success(`${emailIds.length} email ditandai belum dibaca`);
          break;

        case "move-inbox":
          await Promise.all(
            emailIds.map((id) =>
              moveToFolderMutation.mutateAsync({ emailId: id, folder: "inbox" })
            )
          );
          message.success(`${emailIds.length} email dipindahkan ke inbox`);
          break;

        case "move-archive":
          await Promise.all(
            emailIds.map((id) =>
              moveToFolderMutation.mutateAsync({
                emailId: id,
                folder: "archive",
              })
            )
          );
          message.success(`${emailIds.length} email dipindahkan ke arsip`);
          break;

        case "move-spam":
          await Promise.all(
            emailIds.map((id) =>
              moveToFolderMutation.mutateAsync({ emailId: id, folder: "spam" })
            )
          );
          message.success(`${emailIds.length} email dipindahkan ke spam`);
          break;

        case "move-trash":
          await Promise.all(
            emailIds.map((id) =>
              moveToFolderMutation.mutateAsync({ emailId: id, folder: "trash" })
            )
          );
          message.success(`${emailIds.length} email dipindahkan ke sampah`);
          break;

        case "restore-inbox":
          await Promise.all(
            emailIds.map((id) =>
              moveToFolderMutation.mutateAsync({ emailId: id, folder: "inbox" })
            )
          );
          message.success(`${emailIds.length} email dikembalikan ke inbox`);
          break;

        case "label":
          message.info("Fitur pelabelan akan segera hadir");
          break;

        case "add-label":
          message.info("Fitur tambah label akan segera hadir");
          break;

        case "remove-label":
          message.info("Fitur hapus label akan segera hadir");
          break;

        default:
          message.warning(`Aksi ${actionKey} belum diimplementasikan`);
      }

      // Clear selection after successful action
      setSelectedEmails([]);
    } catch (error) {
      console.error(`Error performing bulk ${actionKey}:`, error);
      message.error(`Gagal melakukan ${actionKey}`);
    }
  };

  const confirmBulkDelete = () => {
    const deleteAction =
      folder === "drafts"
        ? Promise.all(
            selectedEmails.map((id) => deleteDraftMutation.mutateAsync(id))
          )
        : bulkDeleteMutation.mutateAsync({
            emailIds: selectedEmails,
            permanent: folder === "trash",
          });

    deleteAction
      .then(() => {
        setSelectedEmails([]);
        setBulkDeleteModal(false);

        const action =
          folder === "drafts"
            ? "dihapus"
            : folder === "trash"
            ? "dihapus permanen"
            : "dipindahkan ke sampah";
        message.success(`${selectedEmails.length} email berhasil ${action}`);
      })
      .catch(() => {
        message.error("Gagal menghapus email");
      });
  };

  // Gmail-style Bulk Action Toolbar
  const renderBulkActionToolbar = () => {
    if (selectedEmails.length === 0) {
      return null;
    }

    const primaryActions = [];
    const secondaryActions = [];

    // Build primary actions based on config
    if (config.bulkActions.primary?.includes("archive")) {
      primaryActions.push({
        key: "archive",
        label: "Arsip",
        icon: <FolderOutlined />,
        onClick: () => handleBulkAction("archive", selectedEmails),
      });
    }

    if (config.bulkActions.primary?.includes("spam")) {
      primaryActions.push({
        key: "spam",
        label: "Tandai Spam",
        icon: <BellOutlined />,
        onClick: () => handleBulkAction("spam", selectedEmails),
      });
    }

    if (config.bulkActions.primary?.includes("not-spam")) {
      primaryActions.push({
        key: "not-spam",
        label: "Bukan Spam",
        icon: <CheckOutlined />,
        onClick: () => handleBulkAction("not-spam", selectedEmails),
      });
    }

    if (config.bulkActions.primary?.includes("delete")) {
      primaryActions.push({
        key: "delete",
        label: "Hapus",
        icon: <DeleteOutlined />,
        onClick: () => handleBulkAction("delete", selectedEmails),
        danger: true,
      });
    }

    if (config.bulkActions.primary?.includes("delete-permanent")) {
      primaryActions.push({
        key: "delete-permanent",
        label: "Hapus Permanen",
        icon: <DeleteOutlined />,
        onClick: () => handleBulkAction("delete-permanent", selectedEmails),
        danger: true,
      });
    }

    if (config.bulkActions.primary?.includes("discard")) {
      primaryActions.push({
        key: "discard",
        label: "Hapus Draft",
        icon: <DeleteOutlined />,
        onClick: () => handleBulkAction("discard", selectedEmails),
        danger: true,
      });
    }

    if (config.bulkActions.primary?.includes("restore-inbox")) {
      primaryActions.push({
        key: "restore-inbox",
        label: "Kembalikan ke Inbox",
        icon: <InboxOutlined />,
        onClick: () => handleBulkAction("restore-inbox", selectedEmails),
      });
    }

    // Build secondary actions
    if (config.bulkActions.secondary?.includes("mark-read")) {
      secondaryActions.push({
        key: "mark-read",
        label: "Tandai dibaca",
        icon: <EyeOutlined />,
        onClick: () => handleBulkAction("mark-read", selectedEmails),
      });
    }

    if (config.bulkActions.secondary?.includes("mark-unread")) {
      secondaryActions.push({
        key: "mark-unread",
        label: "Tandai belum dibaca",
        icon: <EyeOutlined />,
        onClick: () => handleBulkAction("mark-unread", selectedEmails),
      });
    }

    if (config.bulkActions.secondary?.includes("move-inbox")) {
      secondaryActions.push({
        key: "move-inbox",
        label: "Pindahkan ke inbox",
        icon: <InboxOutlined />,
        onClick: () => handleBulkAction("move-inbox", selectedEmails),
      });
    }

    if (config.bulkActions.secondary?.includes("move-to-folder")) {
      const moveToFolderActions = [
        { key: "move-inbox", label: "Inbox", icon: <InboxOutlined /> },
        { key: "move-archive", label: "Arsip", icon: <FolderOutlined /> },
        { key: "move-spam", label: "Spam", icon: <BellOutlined /> },
        { key: "move-trash", label: "Sampah", icon: <DeleteOutlined /> },
      ];

      secondaryActions.push({
        key: "move-to-folder",
        label: "Pindahkan ke folder",
        icon: <FolderOutlined />,
        type: "submenu",
        children: moveToFolderActions,
      });
    }

    const moreActions = [];
    if (config.bulkActions.more?.includes("label")) {
      moreActions.push({
        key: "label",
        label: "Tambah Label",
        icon: <TagOutlined />,
        onClick: () => handleBulkAction("label", selectedEmails),
      });
    }

    return (
      <>
        <Divider style={{ margin: "12px 0" }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            backgroundColor: "#e8f4fd",
            borderRadius: "6px",
            border: "1px solid #1890ff",
          }}
        >
          {/* Select All Checkbox */}
          <Checkbox
            indeterminate={
              selectedEmails.length > 0 &&
              selectedEmails.length < (emailsData?.data?.emails?.length || 0)
            }
            checked={
              selectedEmails.length ===
                (emailsData?.data?.emails?.length || 0) &&
              (emailsData?.data?.emails?.length || 0) > 0
            }
            onChange={(e) => handleSelectAll(e.target.checked)}
          />

          {/* Refresh Button */}
          <Button
            type="text"
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            loading={isLoading}
            title="Refresh"
            style={{ minWidth: "auto", padding: "4px 8px" }}
          />

          <Divider type="vertical" style={{ margin: "0 4px" }} />

          {/* Primary Actions */}
          {primaryActions.map((action) => (
            <Tooltip key={action.key} title={action.label}>
              <Button
                type="text"
                icon={action.icon}
                onClick={action.onClick}
                style={{
                  minWidth: "auto",
                  padding: "4px 8px",
                  ...(action.danger && { color: "#ff4d4f" }),
                }}
                title={action.label}
              />
            </Tooltip>
          ))}

          <Divider type="vertical" style={{ margin: "0 4px" }} />

          {/* Secondary Actions */}
          {secondaryActions.map((action) => {
            if (action.type === "submenu") {
              const submenuItems = action.children?.map((child) => ({
                key: child.key,
                label: child.label,
                icon: child.icon,
                onClick: () => handleBulkAction(child.key, selectedEmails),
              }));

              return (
                <Dropdown
                  key={action.key}
                  menu={{ items: submenuItems }}
                  trigger={["click"]}
                >
                  <Tooltip title={action.label}>
                    <Button
                      type="text"
                      icon={action.icon}
                      style={{
                        minWidth: "auto",
                        padding: "4px 8px",
                      }}
                      title={action.label}
                    />
                  </Tooltip>
                </Dropdown>
              );
            }

            return (
              <Tooltip key={action.key} title={action.label}>
                <Button
                  type="text"
                  icon={action.icon}
                  onClick={action.onClick}
                  style={{
                    minWidth: "auto",
                    padding: "4px 8px",
                  }}
                  title={action.label}
                />
              </Tooltip>
            );
          })}

          {/* More Actions */}
          {moreActions.length > 0 && (
            <Dropdown
              menu={{
                items: [
                  ...moreActions,
                  { type: "divider" },
                  {
                    key: "select-all-page",
                    label: `Pilih semua di halaman ini (${
                      emailsData?.data?.emails?.length || 0
                    })`,
                    icon: <CheckOutlined />,
                    onClick: () => handleSelectAll(true),
                  },
                  {
                    key: "clear-selection",
                    label: "Hapus pilihan",
                    icon: <UndoOutlined />,
                    onClick: () => setSelectedEmails([]),
                  },
                ],
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                title="Tindakan lainnya"
                style={{ minWidth: "auto", padding: "4px 8px" }}
              />
            </Dropdown>
          )}

          {/* Selection Count */}
          <div style={{ marginLeft: "auto" }}>
            <Space size="small">
              <Badge
                count={selectedEmails.length}
                style={{ backgroundColor: config.primaryColor }}
              />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {selectedEmails.length} dipilih
              </Text>
            </Space>
          </div>
        </div>
      </>
    );
  };

  // Email actions
  const getEmailActions = (email) => {
    const actions = [];

    // Read/Unread actions
    if (config.allowMarkAsRead) {
      actions.push({
        key: "read",
        label: email.is_read ? "Tandai belum dibaca" : "Tandai dibaca",
        icon: <EyeOutlined />,
        onClick: () => {
          if (email.is_read) {
            markUnreadMutation.mutate(email.id, {
              onSuccess: () => message.success("Email ditandai belum dibaca"),
            });
          } else {
            markReadMutation.mutate(email.id, {
              onSuccess: () => message.success("Email ditandai sudah dibaca"),
            });
          }
        },
      });
    }

    // Reply actions (tidak untuk drafts/trash)
    if (!["drafts", "trash"].includes(folder)) {
      actions.push({
        key: "reply",
        label: "Balas",
        icon: <SendOutlined />,
        onClick: () => router.push(`/mails/compose?reply=${email.id}`),
      });

      actions.push({
        key: "forward",
        label: "Teruskan",
        icon: <ForwardOutlined />,
        onClick: () => router.push(`/mails/compose?forward=${email.id}`),
      });
    }

    // Edit for drafts
    if (folder === "drafts") {
      actions.push({
        key: "edit",
        label: "Edit Draft",
        icon: <EditOutlined />,
        onClick: () => router.push(`/mails/compose?draft=${email.id}`),
      });
    }

    // Folder-specific actions
    if (folder === "inbox") {
      actions.push(
        {
          key: "archive",
          label: "Arsipkan",
          icon: <FolderOutlined />,
          onClick: () =>
            moveToFolderMutation.mutate(
              { emailId: email.id, folder: "archive" },
              {
                onSuccess: () => message.success("Email berhasil diarsipkan"),
              }
            ),
        },
        {
          key: "spam",
          label: "Tandai Spam",
          icon: <BellOutlined />,
          onClick: () =>
            markAsSpamMutation.mutate(email.id, {
              onSuccess: () => message.success("Email ditandai sebagai spam"),
            }),
        }
      );
    }

    if (folder === "spam") {
      actions.push({
        key: "not-spam",
        label: "Bukan Spam",
        icon: <CheckOutlined />,
        onClick: () =>
          markAsNotSpamMutation.mutate(email.id, {
            onSuccess: () => message.success("Email dikembalikan dari spam"),
          }),
      });
    }

    if (folder === "archive") {
      actions.push({
        key: "inbox",
        label: "Kembalikan ke Inbox",
        icon: <InboxOutlined />,
        onClick: () =>
          moveToFolderMutation.mutate(
            { emailId: email.id, folder: "inbox" },
            {
              onSuccess: () => message.success("Email dikembalikan ke inbox"),
            }
          ),
      });
    }

    if (folder === "trash") {
      actions.push({
        key: "restore",
        label: "Pulihkan",
        icon: <UndoOutlined />,
        onClick: () =>
          moveToFolderMutation.mutate(
            { emailId: email.id, folder: "inbox" },
            {
              onSuccess: () => message.success("Email berhasil dipulihkan"),
            }
          ),
      });
    }

    // Divider sebelum actions berbahaya
    if (actions.length > 0) {
      actions.push({ type: "divider" });
    }

    // Delete action
    if (folder === "drafts") {
      actions.push({
        key: "delete-draft",
        label: "Hapus Draft",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => {
          deleteDraftMutation.mutate(email.id, {
            onSuccess: () => message.success("Draft berhasil dihapus"),
            onError: () => message.error("Gagal menghapus draft"),
          });
        },
      });
    } else if (folder === "trash") {
      actions.push({
        key: "delete-permanent",
        label: "Hapus Permanen",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => {
          deleteMutation.mutate(
            {
              emailId: email.id,
              permanent: true,
            },
            {
              onSuccess: () =>
                message.success("Email berhasil dihapus permanen"),
              onError: () => message.error("Gagal menghapus email"),
            }
          );
        },
      });
    } else {
      actions.push({
        key: "delete",
        label: "Hapus",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => {
          deleteMutation.mutate(
            {
              emailId: email.id,
              permanent: false,
            },
            {
              onSuccess: () => message.success("Email dipindahkan ke sampah"),
              onError: () => message.error("Gagal menghapus email"),
            }
          );
        },
      });
    }

    return actions;
  };

  // Format time
  const formatTime = (date) => {
    const now = dayjs();
    const emailDate = dayjs(date);

    if (now.format("YYYY-MM-DD") === emailDate.format("YYYY-MM-DD")) {
      return emailDate.format("HH:mm");
    } else if (now.year() === emailDate.year()) {
      return emailDate.format("DD MMM");
    } else {
      return emailDate.format("DD/MM/YY");
    }
  };

  // Error state
  if (isError) {
    return (
      <div style={{ padding: "24px" }}>
        <Empty description={`Gagal memuat ${config.subtitle.toLowerCase()}`}>
          <Button type="primary" onClick={handleRefresh}>
            Coba Lagi
          </Button>
        </Empty>
      </div>
    );
  }

  const emails = emailsData?.data?.emails || [];
  const total = emailsData?.data?.total || 0;
  const unreadCount = emails.filter((email) => !email.is_read).length;

  return (
    <div style={{ padding: "16px" }}>
      {/* Header */}
      <Card style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px", color: config.primaryColor }}>
              {config.icon}
            </span>
            <Title level={4} style={{ margin: 0 }}>
              {config.subtitle}
            </Title>
            {config.showUnreadBadge && total > 0 && unreadCount > 0 && (
              <Tag color={config.primaryColor} size="small">
                {unreadCount} baru
              </Tag>
            )}
            {total > 0 && <Text type="secondary">({total} email)</Text>}
          </div>

          {/* Primary actions */}
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleCompose}
            >
              Tulis
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={isLoading}
            />
          </Space>
        </div>

        {/* Filters */}
        <Space wrap>
          <Search
            placeholder="Cari email..."
            allowClear
            value={searchValue}
            onSearch={handleSearch}
            onChange={handleSearchChange}
            style={{ width: 300 }}
            enterButton={<SearchOutlined />}
          />
          {config.availableFilters?.includes("unread") && (
            <Select
              value={queryParams.unreadOnly ? "unread" : "all"}
              onChange={(value) => handleUnreadFilter(value === "unread")}
              style={{ width: 180 }}
              suffixIcon={<FilterOutlined />}
            >
              <Select.Option value="all">
                <Space>
                  <MailOutlined />
                  Semua Email
                </Space>
              </Select.Option>
              <Select.Option value="unread">
                <Space>
                  <Tag color="processing" size="small">
                    •
                  </Tag>
                  Belum Dibaca
                </Space>
              </Select.Option>
            </Select>
          )}
        </Space>

        {/* Bulk Action Toolbar */}
        {renderBulkActionToolbar()}
      </Card>

      {/* Email List */}
      {emails.length === 0 ? (
        <Card>
          <Empty
            description={
              queryParams.search
                ? "Tidak ada email yang cocok dengan pencarian"
                : config.emptyTitle || "Tidak ada email"
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {!queryParams.search && config.emptyAction && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleCompose}
              >
                {config.emptyAction.label}
              </Button>
            )}
          </Empty>
        </Card>
      ) : (
        <Card>
          {/* Simple Select All Row */}
          {selectedEmails.length === 0 && (
            <div
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid #f0f0f0",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Checkbox onChange={(e) => handleSelectAll(e.target.checked)} />

              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
                title="Refresh"
                style={{ minWidth: "auto", padding: "4px 8px" }}
              />

              <div style={{ marginLeft: "auto" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {emails.length} dari {total} email
                </Text>
              </div>
            </div>
          )}

          {/* Email List */}
          <List
            loading={isLoading}
            dataSource={emails}
            renderItem={(email) => {
              const isSelected = selectedEmails.includes(email.id);
              const isUnread = config.allowMarkAsRead ? !email.is_read : false;

              return (
                <List.Item
                  style={{
                    padding: "12px 0",
                    backgroundColor: isSelected
                      ? "#f0f8ff"
                      : isUnread
                      ? "#fafafa"
                      : "white",
                    borderLeft: isUnread
                      ? `3px solid ${config.primaryColor}`
                      : "3px solid transparent",
                    cursor: "pointer",
                    borderRadius: "4px",
                    marginBottom: "4px",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => handleEmailClick(email)}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = isUnread
                        ? "#fafafa"
                        : "white";
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      width: "100%",
                      gap: "12px",
                    }}
                  >
                    {/* Checkbox */}
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectEmail(email.id, e.target.checked);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Star (if available) */}
                    {config.itemActions?.includes("star") && (
                      <Button
                        type="text"
                        size="small"
                        icon={
                          email.is_starred ? (
                            <StarFilled style={{ color: "#faad14" }} />
                          ) : (
                            <StarOutlined style={{ color: "#d9d9d9" }} />
                          )
                        }
                        onClick={(e) => handleStarClick(e, email.id)}
                        style={{ padding: "4px" }}
                      />
                    )}

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ marginBottom: "4px" }}>
                            <Text
                              strong={isUnread}
                              style={{ marginRight: "8px" }}
                            >
                              {config.showRecipient
                                ? email.recipients?.to?.map(
                                    (recipient, index) => (
                                      <span key={index}>
                                        {recipient.name || "Unknown"}
                                        {index < email.recipients.to.length - 1
                                          ? ", "
                                          : ""}
                                      </span>
                                    )
                                  )
                                : email?.sender_id === user?.id
                                ? "Saya"
                                : email.sender_name || email.sender?.username}
                            </Text>
                            {isUnread && config.showUnreadBadge && (
                              <Tag color={config.primaryColor} size="small">
                                BARU
                              </Tag>
                            )}
                            {config.showDraftBadge && (
                              <Tag color={config.primaryColor} size="small">
                                DRAFT
                              </Tag>
                            )}
                            {email.attachment_count > 0 && (
                              <FileOutlined
                                style={{
                                  color: config.primaryColor,
                                  marginLeft: "4px",
                                }}
                                title={`${email.attachment_count} lampiran`}
                              />
                            )}
                          </div>
                          <div style={{ marginBottom: "4px" }}>
                            <Text
                              strong={isUnread}
                              style={{
                                fontSize: "14px",
                                color: isUnread ? "#000" : "#666",
                              }}
                            >
                              {email.subject || "(Tanpa Subjek)"}
                            </Text>
                          </div>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "12px",
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {email.content?.substring(0, 120)}...
                          </Text>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginLeft: "12px",
                          }}
                        >
                          <Text
                            type="secondary"
                            style={{ fontSize: "12px", whiteSpace: "nowrap" }}
                          >
                            {formatTime(email.created_at)}
                          </Text>
                          <div onClick={(e) => e.stopPropagation()}>
                            <Dropdown
                              menu={{ items: getEmailActions(email) }}
                              trigger={["click"]}
                            >
                              <Button
                                type="text"
                                size="small"
                                icon={<MoreOutlined />}
                                style={{ opacity: 0.6 }}
                              />
                            </Dropdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        </Card>
      )}

      {/* Pagination */}
      {total > queryParams.limit && (
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Pagination
            current={queryParams.page}
            total={total}
            pageSize={queryParams.limit}
            onChange={handlePageChange}
            onShowSizeChange={(currentPage, size) => {
              updateQuery({ page: 1, limit: size });
            }}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} dari ${total} email`
            }
            pageSizeOptions={["10", "25", "50", "100"]}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <Space>
            <DeleteOutlined style={{ color: "#ff4d4f" }} />
            Konfirmasi Hapus Email
          </Space>
        }
        open={bulkDeleteModal}
        onOk={confirmBulkDelete}
        onCancel={() => setBulkDeleteModal(false)}
        okText={folder === "drafts" ? "Ya, Hapus Draft" : "Ya, Hapus Sekarang"}
        cancelText="Batal"
        okButtonProps={{
          danger: true,
          loading:
            bulkDeleteMutation.isLoading || deleteDraftMutation.isLoading,
        }}
      >
        <div style={{ padding: "16px 0" }}>
          <Text style={{ fontSize: "16px" }}>
            Anda akan menghapus{" "}
            <Text strong>
              {selectedEmails.length} {folder === "drafts" ? "draft" : "email"}
            </Text>
            .
          </Text>
          <br />
          <br />
          <Text type="secondary">
            {folder === "drafts"
              ? "Draft yang dihapus tidak dapat dipulihkan."
              : folder === "trash"
              ? "Email akan dihapus secara permanen dan tidak dapat dipulihkan."
              : "Email yang dihapus akan dipindahkan ke folder Trash dan dapat dipulihkan dalam 30 hari."}
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default EmailListComponent;

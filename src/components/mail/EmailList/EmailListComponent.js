// src/components/mail/EmailList/EmailListComponent.js
import {
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
import { getFolderConfig } from "@/utils/emailFolderConfig";
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileOutlined,
  FolderOutlined,
  ForwardOutlined,
  InboxOutlined,
  MoreOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
  StarFilled,
  StarOutlined,
  SyncOutlined,
  UndoOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Checkbox,
  Divider,
  Dropdown,
  Empty,
  Input,
  List,
  Modal,
  Pagination,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
  const [searchValue, setSearchValue] = useState(""); // ✅ FIX: Local search state

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

  // ✅ FIX: Sync search value dengan URL
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
  const deleteDraftMutation = useDeleteDraft(); // ✅ FIX: Add delete draft mutation
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

  // ✅ FIX: Search handlers
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
    console.log("handlePageSizeChange called with:", value);
    updateQuery({ limit: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    console.log("handlePageChange called with:", newPage);
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
    // ✅ FIX: Use appropriate delete method based on folder
    console.log(selectedEmails, folder);
    const deleteAction =
      folder === "drafts"
        ? Promise.all(
            selectedEmails.map((id) => deleteDraftMutation.mutateAsync(id))
          )
        : bulkDeleteMutation.mutateAsync({
            emailIds: selectedEmails,
            permanent: folder === "trash" ? true : false,
          });

    deleteAction
      .then((data) => {
        setSelectedEmails([]);
        setBulkDeleteModal(false);

        // ✅ FIX: Success message based on folder
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

  // ✅ IMPROVED: Email actions dengan proper success messages
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

    // ✅ FIX: Delete action - different for drafts vs emails
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

  // Debug pagination data
  console.log("Pagination Debug:", {
    folder,
    queryParams,
    emailsReceived: emails.length,
    totalFromAPI: total,
    calculatedTotalPages: Math.ceil(total / queryParams.limit),
    currentPage: queryParams.page,
    pageSize: queryParams.limit,
  });

  const handleBulkMarkAsRead = () => {
    Promise.all(selectedEmails.map((id) => markReadMutation.mutateAsync(id)))
      .then(() => {
        message.success(`${selectedEmails.length} email ditandai sudah dibaca`);
        setSelectedEmails([]);
      })
      .catch(() => {
        message.error("Gagal menandai email sebagai dibaca");
      });
  };

  const handleBulkMarkAsUnread = () => {
    Promise.all(selectedEmails.map((id) => markUnreadMutation.mutateAsync(id)))
      .then(() => {
        message.success(`${selectedEmails.length} email ditandai belum dibaca`);
        setSelectedEmails([]);
      })
      .catch(() => {
        message.error("Gagal menandai email sebagai belum dibaca");
      });
  };

  const handleBulkArchive = () => {
    Promise.all(
      selectedEmails.map((id) =>
        moveToFolderMutation.mutateAsync({ emailId: id, folder: "archive" })
      )
    )
      .then(() => {
        message.success(`${selectedEmails.length} email berhasil diarsipkan`);
        setSelectedEmails([]);
      })
      .catch(() => {
        message.error("Gagal mengarsipkan email");
      });
  };

  const handleBulkMoveToFolder = (targetFolder) => {
    Promise.all(
      selectedEmails.map((id) =>
        moveToFolderMutation.mutateAsync({ emailId: id, folder: targetFolder })
      )
    )
      .then(() => {
        const folderNames = {
          inbox: "inbox",
          archive: "arsip",
          spam: "spam",
          trash: "sampah",
        };
        message.success(
          `${selectedEmails.length} email dipindahkan ke ${folderNames[targetFolder]}`
        );
        setSelectedEmails([]);
      })
      .catch(() => {
        message.error("Gagal memindahkan email");
      });
  };

  const handleBulkSpam = () => {
    Promise.all(selectedEmails.map((id) => markAsSpamMutation.mutateAsync(id)))
      .then(() => {
        message.success(`${selectedEmails.length} email ditandai sebagai spam`);
        setSelectedEmails([]);
      })
      .catch(() => {
        message.error("Gagal menandai email sebagai spam");
      });
  };

  return (
    <div style={{ padding: "16px" }}>
      {/* Simple Header */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <Title
              level={4}
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {config.icon}
              {config.subtitle}
              {total > 0 && (
                <Text type="secondary" style={{ fontWeight: "normal" }}>
                  ({total} email)
                </Text>
              )}
              {unreadCount > 0 && (
                <Tag color={config.primaryColor} size="small">
                  {unreadCount} baru
                </Tag>
              )}
            </Title>
          </div>
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

        {/* ✅ FIX: Improved Filters with controlled input */}
        <Space wrap>
          <Search
            placeholder="Cari email..."
            allowClear
            value={searchValue}
            onSearch={handleSearch}
            onChange={handleSearchChange}
            style={{ width: 250 }}
            enterButton={<SearchOutlined />}
          />
          {config.availableFilters?.includes("unread") && (
            <Select
              value={queryParams.unreadOnly ? "unread" : "all"}
              onChange={(value) => handleUnreadFilter(value === "unread")}
              style={{ width: 120 }}
            >
              <Select.Option value="all">Semua Email</Select.Option>
              <Select.Option value="unread">Belum Dibaca</Select.Option>
            </Select>
          )}
        </Space>

        {/* Gmail-style Bulk Actions */}
        {selectedEmails.length > 0 && (
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
                  selectedEmails.length < emails.length
                }
                checked={
                  selectedEmails.length === emails.length && emails.length > 0
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

              {/* Archive (jika bukan folder archive/drafts/trash) */}
              {!["archive", "drafts", "trash"].includes(folder) && (
                <Button
                  type="text"
                  icon={<FolderOutlined />}
                  onClick={handleBulkArchive}
                  loading={moveToFolderMutation.isLoading}
                  title="Arsipkan"
                  style={{ minWidth: "auto", padding: "4px 8px" }}
                />
              )}

              {/* Mark as Read/Unread */}
              {config.allowMarkAsRead && (
                <>
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={handleBulkMarkAsRead}
                    loading={markReadMutation.isLoading}
                    title="Tandai sudah dibaca"
                    style={{ minWidth: "auto", padding: "4px 8px" }}
                  />
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={handleBulkMarkAsUnread}
                    loading={markUnreadMutation.isLoading}
                    title="Tandai belum dibaca"
                    style={{
                      minWidth: "auto",
                      padding: "4px 8px",
                      opacity: 0.7,
                    }}
                  />
                </>
              )}

              {/* Delete */}
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={handleBulkDelete}
                loading={
                  bulkDeleteMutation.isLoading || deleteDraftMutation.isLoading
                }
                title={
                  folder === "drafts"
                    ? "Hapus draft"
                    : folder === "trash"
                    ? "Hapus permanen"
                    : "Hapus"
                }
                style={{ minWidth: "auto", padding: "4px 8px" }}
              />

              {/* More Actions Dropdown */}
              <Dropdown
                menu={{
                  items: [
                    // Move to Folder submenu
                    {
                      key: "move-to",
                      label: "Pindahkan ke",
                      icon: <FolderOutlined />,
                      children: [
                        folder !== "inbox" && {
                          key: "move-inbox",
                          label: "Inbox",
                          icon: <InboxOutlined />,
                          onClick: () => handleBulkMoveToFolder("inbox"),
                        },
                        folder !== "archive" && {
                          key: "move-archive",
                          label: "Arsip",
                          icon: <FolderOutlined />,
                          onClick: () => handleBulkMoveToFolder("archive"),
                        },
                        folder !== "spam" && {
                          key: "move-spam",
                          label: "Spam",
                          icon: <BellOutlined />,
                          onClick: () => handleBulkMoveToFolder("spam"),
                        },
                        folder !== "trash" && {
                          key: "move-trash",
                          label: "Sampah",
                          icon: <DeleteOutlined />,
                          onClick: () => handleBulkMoveToFolder("trash"),
                        },
                      ].filter(Boolean),
                    },
                    // Spam actions
                    folder === "spam"
                      ? {
                          key: "not-spam",
                          label: "Bukan spam",
                          icon: <CheckOutlined />,
                          onClick: () => {
                            Promise.all(
                              selectedEmails.map((id) =>
                                markAsNotSpamMutation.mutateAsync(id)
                              )
                            ).then(() => {
                              message.success(
                                `${selectedEmails.length} email dikembalikan dari spam`
                              );
                              setSelectedEmails([]);
                            });
                          },
                        }
                      : {
                          key: "mark-spam",
                          label: "Tandai sebagai spam",
                          icon: <BellOutlined />,
                          onClick: handleBulkSpam,
                        },
                    // Divider
                    { type: "divider" },
                    // Add Label (placeholder)
                    {
                      key: "add-label",
                      label: "Tambah label",
                      icon: <Tag />,
                      onClick: () => {
                        message.info("Fitur label akan segera hadir");
                      },
                    },
                    // Select All
                    {
                      key: "select-all-page",
                      label: `Pilih semua di halaman ini (${emails.length})`,
                      icon: <CheckOutlined />,
                      onClick: () => handleSelectAll(true),
                    },
                    // Clear Selection
                    {
                      key: "clear-selection",
                      label: "Hapus pilihan",
                      icon: <UndoOutlined />,
                      onClick: () => setSelectedEmails([]),
                    },
                  ],
                }}
                trigger={["click"]}
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  title="Tindakan lainnya"
                  style={{ minWidth: "auto", padding: "4px 8px" }}
                />
              </Dropdown>

              {/* Selection Count */}
              <div style={{ marginLeft: "auto" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {selectedEmails.length} dipilih
                </Text>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Email List */}
      {emails.length === 0 ? (
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
      ) : (
        <>
          {/* Gmail-style Select All Row (hanya jika tidak ada yang dipilih) */}
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

                    {/* Avatar */}
                    <Avatar
                      src={
                        config.showRecipient
                          ? email.recipients?.to?.[0]?.image
                          : email.sender_image
                      }
                      icon={<UserOutlined />}
                      size="small"
                    />

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
                                ? email.recipients?.to?.[0]?.name || "Unknown"
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
        </>
      )}

      {/* Fixed Ant Design Pagination */}
      {total > queryParams.limit && (
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Pagination
            current={queryParams.page}
            total={total}
            pageSize={queryParams.limit}
            onChange={(page) => {
              console.log("Page changed to:", page);
              handlePageChange(page);
            }}
            onShowSizeChange={(currentPage, size) => {
              console.log("Size changed to:", size, "from page:", currentPage);
              // Always reset to page 1 when changing page size
              updateQuery({ page: 1, limit: size });
            }}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => {
              console.log("Pagination showTotal:", {
                total,
                range,
                currentPage: queryParams.page,
                pageSize: queryParams.limit,
              });
              return `${range[0]}-${range[1]} dari ${total} email`;
            }}
            pageSizeOptions={["10", "25", "50", "100"]}
          />
        </div>
      )}

      {/* Simple Delete Modal */}
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

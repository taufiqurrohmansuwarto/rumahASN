// src/components/mail/EmailList/EmailListComponent.js
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
import { getFolderConfig } from "@/utils/emailFolderConfig";
import {
  ActionIcon,
  Box,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconArchive,
  IconCheck,
  IconChevronDown,
  IconEdit,
  IconInbox,
  IconMail,
  IconMailOpened,
  IconPaperclip,
  IconRefresh,
  IconSearch,
  IconStar,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Dropdown,
  Input,
  Modal,
  Pagination,
  Tooltip,
  message,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

dayjs.extend(relativeTime);
dayjs.locale("id");

// Email Row Component - Clean minimal
const EmailRow = ({
  email,
  config,
  user,
  isSelected,
  onSelect,
  onStarClick,
  onEmailClick,
  onArchive,
  onDelete,
  onMarkRead,
  onMarkUnread,
}) => {
  const [hovered, setHovered] = useState(false);
  const isUnread = config.allowMarkAsRead ? !email.is_read : false;
  const isSelf = email?.sender_id === user?.id;

  const senderName = config.showRecipient
    ? email.recipients?.to?.[0]?.name || "Penerima"
    : isSelf
    ? "Saya"
    : email.sender_name || email.sender?.username || "?";

  const formatTime = (date) => {
    const now = dayjs();
    const emailDate = dayjs(date);
    if (now.format("YYYY-MM-DD") === emailDate.format("YYYY-MM-DD")) {
      return emailDate.format("HH:mm");
    } else if (now.year() === emailDate.year()) {
      return emailDate.format("D MMM");
    }
    return emailDate.format("D/M/YY");
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onEmailClick(email)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        cursor: "pointer",
        backgroundColor: isUnread ? "#e8f0fe" : hovered ? "#f5f5f5" : "white",
        borderBottom: "1px solid #e0e0e0",
        fontWeight: isUnread ? 600 : 400,
      }}
    >
      {/* 1. Checkbox */}
      <div style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onChange={(e) => onSelect(email.id, e.target.checked)}
        />
      </div>

      {/* 2. Star */}
      {config.itemActions?.includes("star") && (
        <div style={{ flexShrink: 0 }}>
          <ActionIcon
            variant="subtle"
            color={email.is_starred ? "yellow" : "gray"}
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onStarClick(email.id);
            }}
          >
            {email.is_starred ? <IconStarFilled size={16} /> : <IconStar size={16} />}
          </ActionIcon>
        </div>
      )}

      {/* 3. Sender Name */}
      <div style={{ width: 160, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>
        {senderName}
      </div>

      {/* 4. Subject + Preview */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
        <span style={{ flexShrink: 0, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>
          {email.subject || "(Tanpa Subjek)"}
        </span>
        {email.attachment_count > 0 && <IconPaperclip size={14} style={{ color: "#5f6368", flexShrink: 0 }} />}
        <span style={{ color: "#5f6368", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13, fontWeight: 400 }}>
          - {email.content?.substring(0, 50)?.replace(/\n/g, " ")}
        </span>
      </div>

      {/* 5. Time or Actions */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, minWidth: 80, justifyContent: "flex-end" }}>
        {hovered ? (
          <>
            <Tooltip title="Arsipkan">
              <ActionIcon variant="subtle" size="xs" onClick={(e) => { e.stopPropagation(); onArchive(email.id); }}>
                <IconArchive size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip title="Hapus">
              <ActionIcon variant="subtle" size="xs" onClick={(e) => { e.stopPropagation(); onDelete(email.id); }}>
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip title={email.is_read ? "Belum dibaca" : "Sudah dibaca"}>
              <ActionIcon variant="subtle" size="xs" onClick={(e) => { e.stopPropagation(); email.is_read ? onMarkUnread(email.id) : onMarkRead(email.id); }}>
                {email.is_read ? <IconMail size={16} /> : <IconMailOpened size={16} />}
              </ActionIcon>
            </Tooltip>
          </>
        ) : (
          <span style={{ fontSize: 12, color: "#5f6368" }}>{formatTime(email.created_at)}</span>
        )}
      </div>
    </div>
  );
};

const EmailListComponent = ({
  folder = "inbox",
  customConfig = {},
  onEmailClick,
  onCompose,
}) => {
  const router = useRouter();
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterMode, setFilterMode] = useState("all");

  const config = { ...getFolderConfig(folder), ...customConfig };
  const { page = 1, limit = 25, search = "", unread = false } = router.query;

  const queryParams = {
    page: parseInt(page),
    limit: parseInt(limit),
    search: search.toString(),
    unreadOnly: unread === "true",
    ...config.defaultFilter,
  };

  useEffect(() => {
    setSearchValue(queryParams.search);
    setFilterMode(queryParams.unreadOnly ? "unread" : "all");
  }, [queryParams.search, queryParams.unreadOnly]);

  const updateQuery = (newParams) => {
    const updatedQuery = { ...router.query, ...newParams };
    Object.keys(updatedQuery).forEach((key) => {
      if (
        updatedQuery[key] === "" ||
        updatedQuery[key] === false ||
        updatedQuery[key] === "false"
      ) {
        delete updatedQuery[key];
      }
    });
    router.push({ pathname: router.pathname, query: updatedQuery }, undefined, {
      shallow: true,
    });
  };

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
      const params = { ...queryParams, folder };
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

  useEffect(() => {
    setSelectedEmails([]);
  }, [router.query]);

  // Handlers
  const handleEmailClick = async (email) => {
    if (onEmailClick) {
      onEmailClick(email);
      return;
    }
    if (config.clickAction === "edit") {
      router.push(`/mails/compose?draft=${email.id}`);
      return;
    }
    if (config.allowMarkAsRead && !email.is_read) {
      await markReadMutation.mutateAsync(email.id);
    }

    // Tambahkan query params untuk navigasi
    const emailIndex = emails.findIndex((e) => e.id === email.id);
    const emailIds = emails.map((e) => e.id).join(",");

    router.push({
      pathname: `/mails/${folder}/${email.id}`,
      query: {
        idx: emailIndex,
        total: emails.length,
        ids: emailIds,
      },
    });
  };

  const handleStarClick = (emailId) => {
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
      const allEmailIds = emailsData?.data?.emails?.map((email) => email.id) || [];
      setSelectedEmails(allEmailIds);
    } else {
      setSelectedEmails([]);
    }
  };

  const handleSearch = (value) => {
    updateQuery({ search: value, page: 1 });
  };

  const handleFilterChange = (value) => {
    setFilterMode(value);
    updateQuery({ unread: value === "unread", page: 1 });
  };

  const handlePageChange = (newPage, pageSize) => {
    updateQuery({ page: newPage, limit: pageSize });
  };

  const handleRefresh = () => {
    refetch();
    message.success("Diperbarui");
  };

  const handleCompose = () => {
    if (onCompose) {
      onCompose();
    } else {
      router.push("/mails/compose");
    }
  };

  const handleArchive = async (emailId) => {
    try {
      await archiveEmailMutation.mutateAsync(emailId);
      message.success("Diarsipkan");
    } catch {
      message.error("Gagal mengarsipkan");
    }
  };

  const handleDelete = async (emailId) => {
    try {
      if (folder === "drafts") {
        await deleteDraftMutation.mutateAsync(emailId);
      } else {
        await deleteMutation.mutateAsync({ emailId, permanent: folder === "trash" });
      }
      message.success("Dihapus");
    } catch {
      message.error("Gagal menghapus");
    }
  };

  const handleMarkRead = async (emailId) => {
    await markReadMutation.mutateAsync(emailId);
  };

  const handleMarkUnread = async (emailId) => {
    await markUnreadMutation.mutateAsync(emailId);
  };

  // Bulk actions
  const handleBulkAction = async (actionKey) => {
    const emailIds = selectedEmails;
    try {
      switch (actionKey) {
        case "archive":
          await Promise.all(emailIds.map((id) => archiveEmailMutation.mutateAsync(id)));
          message.success(`${emailIds.length} diarsipkan`);
          break;
        case "delete":
          setBulkDeleteModal(true);
          return;
        case "mark-read":
          await Promise.all(emailIds.map((id) => markReadMutation.mutateAsync(id)));
          message.success("Ditandai dibaca");
          break;
        case "mark-unread":
          await Promise.all(emailIds.map((id) => markUnreadMutation.mutateAsync(id)));
          message.success("Ditandai belum dibaca");
          break;
        default:
          break;
      }
      setSelectedEmails([]);
    } catch {
      message.error("Gagal memproses");
    }
  };

  const confirmBulkDelete = () => {
    const deleteAction =
      folder === "drafts"
        ? Promise.all(selectedEmails.map((id) => deleteDraftMutation.mutateAsync(id)))
        : bulkDeleteMutation.mutateAsync({
            emailIds: selectedEmails,
            permanent: folder === "trash",
          });

    deleteAction
      .then(() => {
        setSelectedEmails([]);
        setBulkDeleteModal(false);
        message.success("Berhasil dihapus");
      })
      .catch(() => {
        message.error("Gagal menghapus");
      });
  };

  const getBulkActionItems = () => {
    const items = [];
    items.push({
        key: "archive",
      label: "Arsipkan",
      icon: <IconArchive size={14} />,
      onClick: () => handleBulkAction("archive"),
    });
    items.push({
        key: "mark-read",
        label: "Tandai dibaca",
      icon: <IconMailOpened size={14} />,
      onClick: () => handleBulkAction("mark-read"),
      });
    items.push({
        key: "mark-unread",
        label: "Tandai belum dibaca",
      icon: <IconMail size={14} />,
      onClick: () => handleBulkAction("mark-unread"),
    });
    items.push({ type: "divider" });
    items.push({
        key: "delete",
        label: "Hapus",
      icon: <IconTrash size={14} />,
        danger: true,
      onClick: () => handleBulkAction("delete"),
    });
    return items;
  };

  if (isError) {
    return (
      <Paper p="xl" withBorder>
        <Stack align="center" gap="md">
          <Text c="dimmed">Gagal memuat email</Text>
          <Button type="primary" onClick={handleRefresh}>
            Coba Lagi
          </Button>
        </Stack>
      </Paper>
    );
  }

  const emails = emailsData?.data?.emails || [];
  const total = emailsData?.data?.total || 0;

  return (
    <Stack gap="sm">
      {/* Toolbar */}
      <Paper p={8} withBorder>
        <Group justify="space-between" gap="xs">
          <Group gap={8}>
            <Checkbox
              indeterminate={selectedEmails.length > 0 && selectedEmails.length < emails.length}
              checked={selectedEmails.length === emails.length && emails.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <Input
              placeholder="Cari..."
              prefix={<IconSearch size={12} />}
            value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={() => handleSearch(searchValue)}
              allowClear
              onClear={() => handleSearch("")}
              style={{ width: 180 }}
              size="small"
          />
          {config.availableFilters?.includes("unread") && (
              <SegmentedControl
                size="xs"
                value={filterMode}
                onChange={handleFilterChange}
                data={[
                  { label: "Semua", value: "all" },
                  { label: "Belum dibaca", value: "unread" },
                ]}
              />
            )}
          </Group>

          <Group gap={4}>
            {selectedEmails.length > 0 && (
              <>
                <Text size="xs" c="dimmed">
                  {selectedEmails.length}
                </Text>
                <Dropdown menu={{ items: getBulkActionItems() }} trigger={["click"]}>
                  <Button size="small" icon={<IconChevronDown size={12} />}>
                    Aksi
              </Button>
                </Dropdown>
              </>
            )}
            <Tooltip title="Refresh">
              <Button
                size="small"
                icon={<IconRefresh size={12} />}
                onClick={handleRefresh}
                loading={isLoading}
              />
            </Tooltip>
                      <Button
              type="primary"
                        size="small"
              icon={<IconEdit size={12} />}
              onClick={handleCompose}
            >
              Tulis
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Email List */}
      <Paper withBorder style={{ overflow: "hidden" }}>
        {isLoading ? (
          <Box p="xl" ta="center">
            <Text size="xs" c="dimmed">Memuat...</Text>
          </Box>
        ) : emails.length === 0 ? (
          <Stack align="center" py="xl" gap="xs">
            <IconMail size={32} style={{ color: "#ced4da" }} />
            <Text c="dimmed" size="xs">
              {queryParams.search ? "Tidak ada hasil" : config.emptyTitle || "Kosong"}
                            </Text>
            {!queryParams.search && config.emptyAction && (
              <Button size="small" type="primary" onClick={handleCompose} icon={<IconEdit size={12} />}>
                Tulis Email
              </Button>
            )}
          </Stack>
        ) : (
          emails.map((email) => (
            <EmailRow
              key={email.id}
              email={email}
              config={config}
              user={user}
              isSelected={selectedEmails.includes(email.id)}
              onSelect={handleSelectEmail}
              onStarClick={handleStarClick}
              onEmailClick={handleEmailClick}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onMarkRead={handleMarkRead}
              onMarkUnread={handleMarkUnread}
            />
          ))
        )}
      </Paper>

      {/* Pagination */}
      {total > queryParams.limit && (
        <Group justify="center">
          <Pagination
            current={queryParams.page}
            total={total}
            pageSize={queryParams.limit}
            onChange={handlePageChange}
            showSizeChanger
            size="small"
            showTotal={(t, range) => (
              <Text size="xs" c="dimmed">
                {range[0]}-{range[1]} dari {t}
              </Text>
            )}
            pageSizeOptions={["10", "25", "50"]}
          />
        </Group>
      )}

      {/* Delete Modal */}
      <Modal
        title="Hapus Email"
        open={bulkDeleteModal}
        onOk={confirmBulkDelete}
        onCancel={() => setBulkDeleteModal(false)}
        okText="Hapus"
        cancelText="Batal"
        okButtonProps={{ danger: true, size: "small" }}
        cancelButtonProps={{ size: "small" }}
        width={350}
      >
        <Text size="sm">Hapus {selectedEmails.length} email?</Text>
      </Modal>
    </Stack>
  );
};

export default EmailListComponent;

import {
  useBulkDelete,
  useDeleteEmail,
  useInboxEmails,
  useMarkAsRead,
  useToggleStar,
} from "@/hooks/useEmails";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileOutlined,
  FilterOutlined,
  ForwardOutlined,
  InboxOutlined,
  MailOutlined,
  MoreOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
  StarFilled,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
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
  Tooltip,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ComposeButton from "./EmailCompose/ComposeButton";

const { Text, Title } = Typography;
const { Search } = Input;

const InboxComponent = () => {
  const router = useRouter();
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  // Extract query params with defaults
  const { page = 1, limit = 25, search = "", unread = false } = router.query;

  // Parse params to correct types
  const queryParams = {
    page: parseInt(page),
    limit: parseInt(limit),
    search: search.toString(),
    unreadOnly: unread === "true",
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

  // Hooks
  const {
    data: emailsData,
    isLoading,
    isError,
    refetch,
  } = useInboxEmails(queryParams);

  const markReadMutation = useMarkAsRead();
  const starMutation = useToggleStar();
  const bulkDeleteMutation = useBulkDelete();
  const deleteMutation = useDeleteEmail();

  // Reset selected emails when query changes
  useEffect(() => {
    setSelectedEmails([]);
  }, [router.query]);

  // Handlers
  const handleEmailClick = async (email) => {
    if (!email.is_read) {
      await markReadMutation.mutateAsync(email.id);
    }
    router.push(`/mails/inbox/${email.id}`);
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
    message.success("Inbox diperbarui");
  };

  // Email actions
  const getEmailActions = (email) => [
    {
      key: "read",
      label: "Tandai sebagai dibaca",
      icon: <EyeOutlined />,
      onClick: () => markReadMutation.mutate(email.id),
    },
    {
      key: "reply",
      label: "Balas",
      icon: <SendOutlined />,
      onClick: () => router.push(`/mails/compose?reply=${email.id}`),
    },
    {
      key: "forward",
      label: "Teruskan",
      icon: <ForwardOutlined />,
      onClick: () => router.push(`/mails/compose?forward=${email.id}`),
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: "Hapus",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => deleteMutation.mutate(email.id),
    },
  ];

  // Format time - simple and clear
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

  if (isError) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <Empty description="Gagal memuat inbox">
            <Button type="primary" onClick={refetch}>
              Coba Lagi
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  const emails = emailsData?.data?.emails || [];
  const total = emailsData?.data?.total || 0;
  const hasSelectedEmails = selectedEmails.length > 0;
  const unreadCount = emails.filter((email) => !email.is_read).length;

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      {/* Clear Header with obvious actions */}
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
            <InboxOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
            <Title level={4} style={{ margin: 0 }}>
              Inbox
            </Title>
            {total > 0 && (
              <Badge
                count={unreadCount}
                style={{ backgroundColor: "#52c41a" }}
                showZero={false}
              />
            )}
            {total > 0 && <Text type="secondary">{total} email</Text>}
          </div>

          {/* Primary actions - most important first */}
          <Space>
            <ComposeButton />
            <Tooltip title="Perbarui inbox">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
                size="large"
              />
            </Tooltip>
          </Space>
        </div>

        {/* Clear filters with labels */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Text strong>Cari:</Text>
            <Search
              placeholder="Ketik untuk mencari email..."
              allowClear
              value={queryParams.search}
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
              style={{ width: 300 }}
              enterButton={<SearchOutlined />}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Text strong>Filter:</Text>
            <Select
              value={queryParams.unreadOnly}
              onChange={handleUnreadFilter}
              style={{ width: 140 }}
              suffixIcon={<FilterOutlined />}
            >
              <Select.Option value={false}>
                <Space>
                  <MailOutlined />
                  Semua Email
                </Space>
              </Select.Option>
              <Select.Option value={true}>
                <Space>
                  <Badge dot status="processing" />
                  Belum Dibaca
                </Space>
              </Select.Option>
            </Select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Text strong>Tampilkan:</Text>
            <Select
              value={queryParams.limit}
              onChange={handlePageSizeChange}
              style={{ width: 120 }}
            >
              <Select.Option value={10}>10 per hal</Select.Option>
              <Select.Option value={25}>25 per hal</Select.Option>
              <Select.Option value={50}>50 per hal</Select.Option>
            </Select>
          </div>
        </div>

        {/* Clear bulk actions */}
        {hasSelectedEmails && (
          <>
            <Divider style={{ margin: "16px 0 12px 0" }} />
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#e6f7ff",
                borderRadius: "6px",
                border: "1px solid #91d5ff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space>
                <Badge
                  count={selectedEmails.length}
                  style={{ backgroundColor: "#1890ff" }}
                />
                <Text strong>{selectedEmails.length} email dipilih</Text>
              </Space>
              <Space>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleBulkDelete}
                  loading={bulkDeleteMutation.isLoading}
                >
                  Hapus yang Dipilih
                </Button>
                <Button onClick={() => setSelectedEmails([])}>
                  Batal Pilih
                </Button>
              </Space>
            </div>
          </>
        )}
      </Card>

      {/* Email List - Clean and scannable */}
      <Card loading={isLoading}>
        {emails.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <Empty
              description={
                queryParams.search
                  ? "Tidak ada email yang cocok dengan pencarian Anda"
                  : "Inbox Anda kosong"
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {!queryParams.search && (
                <div style={{ marginTop: "16px" }}>
                  <Text
                    type="secondary"
                    style={{ display: "block", marginBottom: "16px" }}
                  >
                    Mulai berkirim email dengan kolega Anda
                  </Text>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    size="large"
                    onClick={() => router.push("/mails/compose")}
                  >
                    Tulis Email Pertama
                  </Button>
                </div>
              )}
            </Empty>
          </div>
        ) : (
          <>
            {/* Clear select all header */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #f0f0f0",
                backgroundColor: "#fafafa",
              }}
            >
              <Checkbox
                indeterminate={
                  selectedEmails.length > 0 &&
                  selectedEmails.length < emails.length
                }
                checked={
                  selectedEmails.length === emails.length && emails.length > 0
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                <Text>
                  {selectedEmails.length > 0
                    ? `${selectedEmails.length} dari ${emails.length} email dipilih`
                    : `Pilih semua ${emails.length} email`}
                </Text>
              </Checkbox>
            </div>

            {/* Email list with clear visual hierarchy */}
            <List
              dataSource={emails}
              renderItem={(email) => {
                const isSelected = selectedEmails.includes(email.id);
                const isUnread = !email.is_read;

                return (
                  <List.Item
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid #f0f0f0",
                      backgroundColor: isSelected
                        ? "#e6f7ff"
                        : isUnread
                        ? "#fafbfc"
                        : "white",
                      borderLeft: isUnread
                        ? "4px solid #1890ff"
                        : "4px solid transparent",
                      cursor: "pointer",
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
                          ? "#fafbfc"
                          : "white";
                      }
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Space size="middle">
                          {/* Clear checkbox */}
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectEmail(email.id, e.target.checked);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />

                          {/* Clear star action */}
                          <Tooltip
                            title={
                              email.is_starred
                                ? "Hapus dari favorit"
                                : "Tandai favorit"
                            }
                          >
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
                            />
                          </Tooltip>

                          {/* Clear sender avatar */}
                          <Avatar
                            src={email.sender_image}
                            icon={<UserOutlined />}
                            size="default"
                          />
                        </Space>
                      }
                      title={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "16px",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Clear sender name */}
                            <div style={{ marginBottom: "4px" }}>
                              <Space>
                                <Text
                                  strong={isUnread}
                                  style={{
                                    fontSize: "14px",
                                    color: isUnread ? "#262626" : "#595959",
                                  }}
                                >
                                  {email.sender_name || email.sender?.username}
                                </Text>
                                {isUnread && (
                                  <Tag color="blue" size="small">
                                    BARU
                                  </Tag>
                                )}
                              </Space>
                            </div>

                            {/* Clear subject */}
                            <div style={{ marginBottom: "4px" }}>
                              <Space>
                                <Text
                                  strong={isUnread}
                                  style={{
                                    fontSize: "16px",
                                    color: isUnread ? "#262626" : "#595959",
                                    fontWeight: isUnread ? 600 : 400,
                                  }}
                                >
                                  {email.subject || "(Tanpa Subjek)"}
                                </Text>
                                {email.attachment_count > 0 && (
                                  <Tooltip
                                    title={`${email.attachment_count} lampiran`}
                                  >
                                    <FileOutlined
                                      style={{ color: "#1890ff" }}
                                    />
                                  </Tooltip>
                                )}
                              </Space>
                            </div>
                          </div>

                          {/* Clear time and actions */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <Text
                              type="secondary"
                              style={{
                                fontSize: "13px",
                                whiteSpace: "nowrap",
                                minWidth: "fit-content",
                              }}
                            >
                              {formatTime(email.created_at)}
                            </Text>

                            <Dropdown
                              menu={{ items: getEmailActions(email) }}
                              trigger={["click"]}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                type="text"
                                size="small"
                                icon={<MoreOutlined />}
                                onClick={(e) => e.stopPropagation()}
                                style={{ opacity: 0.7 }}
                              />
                            </Dropdown>
                          </div>
                        </div>
                      }
                      description={
                        <Text
                          type="secondary"
                          style={{
                            fontSize: "13px",
                            lineHeight: "1.4",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          {email.content?.substring(0, 120)}...
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </>
        )}
      </Card>

      {/* Clear pagination */}
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

      {/* Clear confirmation modal */}
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
        okText="Ya, Hapus Sekarang"
        cancelText="Batal"
        okButtonProps={{
          danger: true,
          loading: bulkDeleteMutation.isLoading,
        }}
      >
        <div style={{ padding: "16px 0" }}>
          <Text style={{ fontSize: "16px" }}>
            Anda akan menghapus{" "}
            <Text strong>{selectedEmails.length} email</Text>.
          </Text>
          <br />
          <br />
          <Text type="secondary">
            Email yang dihapus akan dipindahkan ke folder Trash dan dapat
            dipulihkan dalam 30 hari.
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default InboxComponent;

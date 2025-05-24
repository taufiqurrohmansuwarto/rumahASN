import {
  DeleteOutlined,
  EyeOutlined,
  MailOutlined,
  MoreOutlined,
  PaperClipOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
  ShareAltOutlined,
  StarFilled,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
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
import { useRouter } from "next/router";
import { useState } from "react";
import dayjs from "dayjs";
import {
  useInboxEmails,
  useMarkAsRead,
  useToggleStar,
  useBulkDelete,
  useDeleteEmail,
} from "@/hooks/useEmails";

const { Text, Title } = Typography;
const { Search } = Input;

const InboxComponent = () => {
  const router = useRouter();

  // States
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

  // Query params
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    unreadOnly,
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

  // Handlers
  const handleEmailClick = async (email) => {
    // Mark as read if unread
    if (!email.is_read) {
      await markReadMutation.mutateAsync(email.id);
    }

    // Navigate to email detail
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

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    refetch();
    message.success("Inbox diperbarui");
  };

  // Email actions dropdown
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
      icon: <ShareAltOutlined />,
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

  // Render email item
  const renderEmailItem = (email) => {
    const isSelected = selectedEmails.includes(email.id);
    const isUnread = !email.is_read;

    return (
      <List.Item
        key={email.id}
        className={`email-item ${isUnread ? "unread" : ""} ${
          isSelected ? "selected" : ""
        }`}
        style={{
          padding: "12px 16px",
          borderLeft: isUnread ? "3px solid #1890ff" : "3px solid transparent",
          backgroundColor: isSelected
            ? "#e6f7ff"
            : isUnread
            ? "#fafafa"
            : "white",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onClick={() => handleEmailClick(email)}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = "#f5f5f5";
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
            alignItems: "center",
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

          {/* Star */}
          <Button
            type="text"
            size="small"
            icon={
              email.is_starred ? (
                <StarFilled style={{ color: "#faad14" }} />
              ) : (
                <StarOutlined />
              )
            }
            onClick={(e) => handleStarClick(e, email.id)}
            style={{ padding: "4px" }}
          />

          {/* Sender Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              minWidth: "200px",
              flex: "0 0 200px",
            }}
          >
            <Avatar
              src={email.sender?.image}
              icon={<UserOutlined />}
              size="small"
              style={{ marginRight: "8px" }}
            />
            <Text
              strong={isUnread}
              ellipsis
              style={{ fontSize: isUnread ? "14px" : "13px" }}
            >
              {email.sender_name || email.sender?.username}
            </Text>
          </div>

          {/* Subject and Content Preview */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "2px",
              }}
            >
              <Text
                strong={isUnread}
                ellipsis
                style={{
                  fontSize: isUnread ? "14px" : "13px",
                  color: isUnread ? "#262626" : "#595959",
                }}
              >
                {email.subject || "(Tanpa Subjek)"}
              </Text>
              {email.attachment_count > 0 && (
                <PaperClipOutlined
                  style={{ color: "#8c8c8c", fontSize: "12px" }}
                />
              )}
            </div>
            <Text
              type="secondary"
              ellipsis
              style={{ fontSize: "12px", lineHeight: "1.2" }}
            >
              {email.content?.substring(0, 100)}...
            </Text>
          </div>

          {/* Date and Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: "0 0 120px",
              justifyContent: "flex-end",
            }}
          >
            <Text
              type="secondary"
              style={{ fontSize: "12px", whiteSpace: "nowrap" }}
            >
              {dayjs(email.created_at).format("DD/MM/YY")}
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
                style={{ opacity: 0.6 }}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </div>
        </div>
      </List.Item>
    );
  };

  if (isError) {
    return (
      <Card>
        <Empty
          description="Gagal memuat inbox"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={refetch}>
            Coba Lagi
          </Button>
        </Empty>
      </Card>
    );
  }

  const emails = emailsData?.data?.emails || [];
  const total = emailsData?.data?.total || 0;
  const hasSelectedEmails = selectedEmails.length > 0;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Card
        size="small"
        style={{ marginBottom: "16px", borderRadius: "8px" }}
        bodyStyle={{ padding: "16px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            <MailOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
            Inbox
            {total > 0 && (
              <Tag color="blue" style={{ marginLeft: "8px" }}>
                {total}
              </Tag>
            )}
          </Title>

          <Space>
            <Tooltip title="Refresh">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
              />
            </Tooltip>
          </Space>
        </div>

        {/* Search and Filters */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Search
            placeholder="Cari email..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && handleSearch("")}
            style={{ width: "300px" }}
            enterButton={<SearchOutlined />}
          />

          <Select
            value={unreadOnly}
            onChange={setUnreadOnly}
            style={{ width: "120px" }}
          >
            <Select.Option value={false}>Semua</Select.Option>
            <Select.Option value={true}>Belum Dibaca</Select.Option>
          </Select>

          <Select
            value={pageSize}
            onChange={(value) => {
              setPageSize(value);
              setCurrentPage(1);
            }}
            style={{ width: "100px" }}
          >
            <Select.Option value={10}>10/hal</Select.Option>
            <Select.Option value={25}>25/hal</Select.Option>
            <Select.Option value={50}>50/hal</Select.Option>
          </Select>
        </div>

        {/* Bulk Actions */}
        {hasSelectedEmails && (
          <div
            style={{
              marginTop: "12px",
              padding: "8px 12px",
              backgroundColor: "#e6f7ff",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text>{selectedEmails.length} email dipilih</Text>
            <Space>
              <Button
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleBulkDelete}
                loading={bulkDeleteMutation.isLoading}
              >
                Hapus Terpilih
              </Button>
              <Button size="small" onClick={() => setSelectedEmails([])}>
                Batal
              </Button>
            </Space>
          </div>
        )}
      </Card>

      {/* Email List */}
      <Card
        style={{ flex: 1, borderRadius: "8px" }}
        bodyStyle={{ padding: 0 }}
        loading={isLoading}
      >
        {emails.length === 0 ? (
          <div style={{ padding: "48px" }}>
            <Empty
              description={
                searchTerm ? "Tidak ada email yang cocok" : "Inbox kosong"
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <>
            {/* Select All Header */}
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
                checked={selectedEmails.length === emails.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                <Text type="secondary">
                  {selectedEmails.length > 0
                    ? `${selectedEmails.length} dari ${emails.length} dipilih`
                    : `Pilih semua (${emails.length})`}
                </Text>
              </Checkbox>
            </div>

            {/* Email List */}
            <List
              dataSource={emails}
              renderItem={renderEmailItem}
              split={false}
              style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}
            />
          </>
        )}
      </Card>

      {/* Pagination */}
      {total > pageSize && (
        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={setCurrentPage}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} dari ${total} email`
            }
          />
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        title="Konfirmasi Hapus"
        open={bulkDeleteModal}
        onOk={confirmBulkDelete}
        onCancel={() => setBulkDeleteModal(false)}
        okText="Hapus"
        cancelText="Batal"
        okButtonProps={{
          danger: true,
          loading: bulkDeleteMutation.isLoading,
        }}
      >
        <p>
          Apakah Anda yakin ingin menghapus {selectedEmails.length} email yang
          dipilih? Email akan dipindahkan ke folder Trash.
        </p>
      </Modal>
    </div>
  );
};

export default InboxComponent;

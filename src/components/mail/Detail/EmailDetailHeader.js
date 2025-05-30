import {
  CaretDownOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FlagFilled,
  FlagOutlined,
  FolderOutlined,
  InboxOutlined,
  MailOutlined,
  StarFilled,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Descriptions,
  Divider,
  Dropdown,
  Flex,
  Menu,
  Popover,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import EmailLabelSelector from "./EmailLabelSelector";

// CSS untuk action buttons
const actionButtonStyles = `
  .action-button:hover {
    background-color: #f5f5f5 !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .action-button:active {
    transform: translateY(0);
  }
  .recipient-info-trigger:hover .anticon {
    color: #1890ff !important;
  }
  .email-recipient-popover .ant-popover-content {
    border-radius: 8px;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = actionButtonStyles;
  if (!document.head.querySelector("style[data-email-actions]")) {
    styleElement.setAttribute("data-email-actions", "true");
    document.head.appendChild(styleElement);
  }
}

// Konfigurasi dayjs
dayjs.extend(relativeTime);
dayjs.locale("id");

const { Title, Text } = Typography;

// Komponen untuk menampilkan prioritas email
const EmailPriority = ({ priority }) => {
  if (!priority || priority === "normal") return null;

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case "high":
        return {
          color: "red",
          icon: <FlagFilled />,
          text: "Prioritas Tinggi",
        };
      case "low":
        return {
          color: "blue",
          icon: <FlagOutlined />,
          text: "Prioritas Rendah",
        };
      default:
        return {
          color: "default",
          icon: <FlagOutlined />,
          text: "Prioritas Normal",
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <Tag
      color={config.color}
      icon={config.icon}
      style={{
        marginTop: "8px",
        borderRadius: "4px",
        fontSize: "12px",
      }}
    >
      {config.text}
    </Tag>
  );
};

// Komponen untuk action buttons
const EmailActionButtons = ({
  email,
  onToggleStar,
  isStarLoading,
  onToggleUnread,
  isUnreadLoading,
  onMoveToFolder,
  isMoveToFolderLoading,
  onRefresh,
  onUpdatePriority,
  isUpdatePriorityLoading,
}) => {
  return (
    <div
      style={{
        background: "#fafafa",
        borderRadius: "8px",
        padding: "8px 12px",
        marginBottom: "16px",
        border: "1px solid #f0f0f0",
      }}
    >
      <Flex justify="space-between" align="center">
        <Space size={4}>
          <StarButton
            isStarred={email.is_starred}
            onToggleStar={onToggleStar}
            isLoading={isStarLoading}
          />
          <Divider
            type="vertical"
            style={{ height: "20px", margin: "0 4px" }}
          />
          <ReadStatusButton
            onToggleUnread={onToggleUnread}
            isUnreadLoading={isUnreadLoading}
          />
          <MoveToFolderButton
            onMoveToFolder={onMoveToFolder}
            isLoading={isMoveToFolderLoading}
          />
          <Divider
            type="vertical"
            style={{ height: "20px", margin: "0 4px" }}
          />
          <FlagPriorityButton
            priority={email.priority}
            onUpdatePriority={onUpdatePriority}
            isLoading={isUpdatePriorityLoading}
          />
        </Space>
        <EmailLabelSelector emailId={email.id} onRefresh={onRefresh} />
      </Flex>
    </div>
  );
};

// Komponen untuk tombol bintang
const StarButton = ({ isStarred, onToggleStar, isLoading }) => {
  return (
    <Tooltip title={isStarred ? "Hapus bintang" : "Beri bintang"}>
      <Button
        type="text"
        size="small"
        icon={
          isStarred ? (
            <StarFilled style={{ fontSize: "16px", color: "#faad14" }} />
          ) : (
            <StarOutlined style={{ fontSize: "16px", color: "#8c8c8c" }} />
          )
        }
        onClick={onToggleStar}
        loading={isLoading}
        style={{
          padding: "4px 6px",
          height: "28px",
          borderRadius: "4px",
          transition: "all 0.2s ease",
        }}
        className="action-button"
      />
    </Tooltip>
  );
};

// Komponen untuk mark as read/unread
const ReadStatusButton = ({ onToggleUnread, isUnreadLoading }) => {
  return (
    <Tooltip title="Tandai belum dibaca">
      <Button
        type="text"
        size="small"
        icon={<MailOutlined style={{ fontSize: "16px", color: "#8c8c8c" }} />}
        onClick={onToggleUnread}
        loading={isUnreadLoading}
        style={{
          padding: "4px 6px",
          height: "28px",
          borderRadius: "4px",
          transition: "all 0.2s ease",
        }}
        className="action-button"
      />
    </Tooltip>
  );
};

// Komponen untuk move to folder
const MoveToFolderButton = ({ onMoveToFolder, isLoading }) => {
  const folderOptions = [
    {
      key: "inbox",
      label: "Kotak Masuk",
      icon: <InboxOutlined style={{ color: "#1890ff" }} />,
    },
    {
      key: "archive",
      label: "Arsip",
      icon: <FolderOutlined style={{ color: "#52c41a" }} />,
    },
    {
      key: "spam",
      label: "Spam",
      icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
    },
    {
      key: "trash",
      label: "Sampah",
      icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
    },
  ];

  const handleMenuClick = ({ key }) => {
    onMoveToFolder(key);
  };

  const menu = (
    <Menu
      onClick={handleMenuClick}
      style={{ borderRadius: "6px", minWidth: "160px" }}
    >
      {folderOptions.map((folder) => (
        <Menu.Item
          key={folder.key}
          icon={folder.icon}
          style={{
            borderRadius: "4px",
            margin: "2px 4px",
            fontSize: "14px",
          }}
        >
          {folder.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]} placement="bottomLeft">
      <Tooltip title="Pindah ke folder">
        <Button
          type="text"
          size="small"
          icon={
            <FolderOutlined style={{ fontSize: "16px", color: "#8c8c8c" }} />
          }
          loading={isLoading}
          style={{
            padding: "4px 6px",
            height: "28px",
            borderRadius: "4px",
            transition: "all 0.2s ease",
          }}
          className="action-button"
        />
      </Tooltip>
    </Dropdown>
  );
};

// Komponen untuk flag priority
const FlagPriorityButton = ({ priority, isLoading, onUpdatePriority }) => {
  const priorityOptions = [
    {
      key: "high",
      label: "Prioritas Tinggi",
      color: "red",
      icon: <FlagFilled style={{ color: "#ff4d4f" }} />,
    },
    {
      key: "normal",
      label: "Prioritas Normal",
      color: "default",
      icon: <FlagOutlined />,
    },
    {
      key: "low",
      label: "Prioritas Rendah",
      color: "blue",
      icon: <FlagOutlined style={{ color: "#1890ff" }} />,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (onUpdatePriority) {
      onUpdatePriority(key);
    }
  };

  const menu = (
    <Menu
      onClick={handleMenuClick}
      style={{ borderRadius: "6px", minWidth: "160px" }}
    >
      {priorityOptions.map((option) => (
        <Menu.Item
          key={option.key}
          icon={option.icon}
          style={{
            borderRadius: "4px",
            margin: "2px 4px",
            fontSize: "14px",
          }}
        >
          <Tag
            color={option.color}
            style={{
              margin: 0,
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            {option.label}
          </Tag>
        </Menu.Item>
      ))}
    </Menu>
  );

  const getCurrentPriorityIcon = () => {
    switch (priority) {
      case "high":
        return <FlagFilled style={{ fontSize: "16px", color: "#ff4d4f" }} />;
      case "low":
        return <FlagOutlined style={{ fontSize: "16px", color: "#1890ff" }} />;
      default:
        return <FlagOutlined style={{ fontSize: "16px", color: "#8c8c8c" }} />;
    }
  };

  return (
    <Dropdown overlay={menu} trigger={["click"]} placement="bottomLeft">
      <Tooltip title="Ubah prioritas">
        <Button
          type="text"
          size="small"
          icon={getCurrentPriorityIcon()}
          loading={isLoading}
          style={{
            padding: "4px 6px",
            height: "28px",
            borderRadius: "4px",
            transition: "all 0.2s ease",
          }}
          className="action-button"
        />
      </Tooltip>
    </Dropdown>
  );
};

// Fungsi untuk menampilkan konten penerima dalam popover
const contentRecipient = (email) => {
  const formatRecipients = (recipients) => {
    if (!recipients || recipients.length === 0) return "-";
    return recipients
      .map((recipient) => recipient.user?.username || recipient.email)
      .join(", ");
  };

  return (
    <Descriptions
      size="small"
      column={1}
      labelStyle={{
        fontWeight: "600",
        color: "#595959",
        width: "80px",
      }}
      contentStyle={{
        color: "#262626",
      }}
    >
      <Descriptions.Item label="Pengirim">
        {email.sender?.username || email.sender_name || "-"}
      </Descriptions.Item>
      <Descriptions.Item label="Kepada">
        {formatRecipients(email?.recipients?.to)}
      </Descriptions.Item>
      {email?.recipients?.cc && email.recipients.cc.length > 0 && (
        <Descriptions.Item label="CC">
          {formatRecipients(email.recipients.cc)}
        </Descriptions.Item>
      )}
      {email?.recipients?.bcc && email.recipients.bcc.length > 0 && (
        <Descriptions.Item label="BCC">
          {formatRecipients(email.recipients.bcc)}
        </Descriptions.Item>
      )}
      <Descriptions.Item label="Subjek">
        {email.subject || "(Tanpa Subjek)"}
      </Descriptions.Item>
      <Descriptions.Item label="Tanggal">
        {dayjs(email.created_at).format("DD MMMM YYYY, HH:mm")}
      </Descriptions.Item>
    </Descriptions>
  );
};

// Komponen untuk informasi pengirim
const SenderInfo = ({ sender, senderName, email }) => {
  const displayName =
    sender?.username || senderName || "Pengirim Tidak Dikenal";

  return (
    <div>
      <Flex align="center" gap={20}>
        <Avatar
          src={sender?.image}
          icon={<UserOutlined />}
          size="large"
          style={{
            backgroundColor: sender?.image ? "transparent" : "#1890ff",
          }}
        />
        <Flex vertical gap={0}>
          <Text
            strong
            style={{
              fontSize: "16px",
              color: "#262626",
            }}
          >
            {displayName}
          </Text>
          <Space
            style={{
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            className="recipient-info-trigger"
          >
            <Text type="secondary" style={{ fontSize: "14px" }}>
              kepada saya
            </Text>
            <Popover
              content={contentRecipient(email)}
              trigger="click"
              placement="bottomLeft"
              overlayStyle={{
                minWidth: "350px",
                maxWidth: "450px",
              }}
              overlayClassName="email-recipient-popover"
            >
              <CaretDownOutlined
                style={{
                  color: "#8c8c8c",
                  fontSize: "12px",
                  transition: "color 0.2s ease",
                }}
              />
            </Popover>
          </Space>
        </Flex>
      </Flex>
    </div>
  );
};

// Komponen untuk tanggal email
const EmailDate = ({ createdAt }) => {
  const formatDate = (date) => {
    const now = dayjs();
    const emailDate = dayjs(date);

    if (now.diff(emailDate, "day") === 0) {
      return emailDate.format("HH:mm");
    } else if (now.diff(emailDate, "day") < 7) {
      return emailDate.format("dddd, HH:mm");
    } else {
      return emailDate.format("DD MMM YYYY, HH:mm");
    }
  };

  return (
    <Space size="small">
      <ClockCircleOutlined
        style={{
          color: "#8c8c8c",
          fontSize: "14px",
        }}
      />
      <Tooltip title={dayjs(createdAt).format("DD MMMM YYYY, HH:mm:ss")}>
        <Text type="secondary" style={{ fontSize: "14px" }}>
          {formatDate(createdAt)}
        </Text>
      </Tooltip>
    </Space>
  );
};

// Komponen utama header email
const EmailDetailHeader = ({
  email,
  onToggleStar,
  isStarLoading = false,
  onToggleUnread,
  isUnreadLoading = false,
  onMoveToFolder,
  isMoveToFolderLoading = false,
  onUpdatePriority,
  isUpdatePriorityLoading = false,
  onRefresh,
}) => {
  if (!email) return null;

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Action Buttons */}
      <EmailActionButtons
        email={email}
        onToggleStar={onToggleStar}
        isStarLoading={isStarLoading}
        onToggleUnread={onToggleUnread}
        isUnreadLoading={isUnreadLoading}
        onMoveToFolder={onMoveToFolder}
        isMoveToFolderLoading={isMoveToFolderLoading}
        onUpdatePriority={onUpdatePriority}
        isUpdatePriorityLoading={isUpdatePriorityLoading}
        onRefresh={onRefresh}
      />

      {/* Sender Info and Date */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <SenderInfo
          sender={email.sender}
          senderName={email.sender_name}
          email={email}
        />
        <EmailDate createdAt={email.created_at} />
      </div>

      <Divider style={{ margin: "16px 0" }} />
    </div>
  );
};

export default EmailDetailHeader;
